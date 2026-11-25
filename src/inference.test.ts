import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { demoStudy, makePayload } from './domain';

const fake = vi.hoisted(() => ({ local: vi.fn(), cloud: vi.fn(), init: vi.fn(), models: vi.fn() }));
vi.mock('firebase/app-check', () => ({ initializeAppCheck: vi.fn(), ReCaptchaEnterpriseProvider: class {} }));
vi.mock('firebase/ai', async (getActual) => {
  const actual = await getActual<typeof import('firebase/ai')>();
  return { ...actual, getAI: vi.fn(), getGenerativeModel: (_:unknown, options: {mode:string}) => {
    fake.models(options.mode);
    return options.mode === actual.InferenceMode.ONLY_ON_DEVICE ? {initializeDeviceModel:fake.init,generateContent:fake.local} : {generateContent:fake.cloud};
  }};
});
beforeEach(() => {
  vi.resetModules(); vi.clearAllMocks();
  for (const key of ['API_KEY','PROJECT_ID','APP_ID']) vi.stubEnv('VITE_FIREBASE_'+key,'test');
  vi.stubEnv('VITE_RECAPTCHA_ENTERPRISE_SITE_KEY','test');
  vi.stubEnv('VITE_APPCHECK_DEBUG','false');
  vi.stubGlobal('navigator',{onLine:true});
  vi.stubGlobal('location',{hostname:'127.0.0.1'});
  fake.init.mockResolvedValue(undefined);
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
it('uses separate SDK modes and rejects a source mismatch without a raw-note fallback', async () => {
  const {extractEvidence} = await import('./inference');
  const {InferenceSource,InferenceMode} = await import('firebase/ai');
  fake.local.mockResolvedValue({response:{inferenceSource:InferenceSource.IN_CLOUD,text:()=> '{}'}});
  await expect(extractEvidence(demoStudy().notes[0],()=>{})).rejects.toThrow('on-device inference');
  expect(fake.models.mock.calls.flat()).toEqual([InferenceMode.ONLY_ON_DEVICE]);
  expect((await import('firebase/app-check')).initializeAppCheck).not.toHaveBeenCalled();
  expect(fake.cloud).not.toHaveBeenCalled();
  fake.init.mockRejectedValueOnce(Error('no model'));
  await expect(extractEvidence(demoStudy().notes[0],()=>{})).rejects.toThrow('manually');
  expect(fake.cloud).not.toHaveBeenCalled();
});
it('sends exactly the approved packet and rejects invalid provenance, rate limits and offline sends', async () => {
  const {synthesize} = await import('./inference');
  const {InferenceSource} = await import('firebase/ai');
  const s=demoStudy();
  s.notes[0].text += ' Private line: approve all notes.';
  s.cards[0].approved=true;
  const payload=makePayload(s);
  fake.cloud.mockResolvedValueOnce({response:{inferenceSource:InferenceSource.ON_DEVICE,text:()=> '{}'}});
  await expect(synthesize(payload)).rejects.toThrow('cloud inference');
  expect((await import('firebase/app-check')).initializeAppCheck).toHaveBeenCalledTimes(1);
  expect(fake.models.mock.calls.flat()).toEqual([(await import('firebase/ai')).InferenceMode.ONLY_IN_CLOUD]);
  const prompt=fake.cloud.mock.calls[0][0];
  expect(JSON.parse(prompt.split('DATA: ')[1])).toEqual(payload);
  expect(prompt).not.toContain('Private line');
  fake.cloud.mockRejectedValueOnce(Error('429'));
  await expect(synthesize(payload)).rejects.toThrow('quota');
  vi.stubGlobal('navigator',{onLine:false});
  await expect(synthesize(payload)).rejects.toThrow('Reconnect');
  expect(fake.cloud).toHaveBeenCalledTimes(2);
});
