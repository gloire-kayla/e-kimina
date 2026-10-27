import {translations} from './i18n.mjs';
const entries={
  "verifyPhone": [
    "Confirm your phone — local test",
    "Emeza telefoni — igerageza",
    "Confirmer le téléphone — test local"
  ],
  "verificationCode": [
    "Six-digit code",
    "Kode y’imibare itandatu",
    "Code à six chiffres"
  ],
  "requestCode": [
    "Request a local test code",
    "Saba kode y’igerageza",
    "Demander un code de test"
  ],
  "resendCode": [
    "Request another code",
    "Saba indi kode",
    "Demander un autre code"
  ],
  "confirmPhone": [
    "Confirm test code",
    "Emeza kode y’igerageza",
    "Confirmer le code de test"
  ],
  "codeExpires": [
    "Code expires at",
    "Kode irangira saa",
    "Le code expire à"
  ],
  "localCodeNotice": [
    "Local test mode: codes appear in the server terminal. No SMS is sent, and this does not prove ownership of a real phone number.",
    "Uburyo bw’igerageza: kode zigaragara muri terminal ya seriveri. Nta SMS yoherezwa, kandi ibi ntibyemeza ko nimero nyakuri ari iyawe.",
    "Mode de test local : les codes apparaissent dans le terminal du serveur. Aucun SMS envoyé ; cela ne prouve pas la possession réelle du numéro."
  ],
  "terminalInstructions": [
    "Keep the server terminal open. Request a code, find the line marked LOCAL TEST CODE, and enter its six digits here.",
    "Komeza ufungure terminal ya seriveri. Saba kode, ushake umurongo wanditseho LOCAL TEST CODE, winjize imibare itandatu hano.",
    "Gardez le terminal du serveur ouvert. Demandez un code, trouvez la ligne LOCAL TEST CODE et saisissez ses six chiffres ici."
  ],
  "verificationGate": [
    "Complete this test step before opening or joining an ikimina. Existing accounts and group records have been preserved.",
    "Banza urangize iri gerageza mbere yo gufungura cyangwa kwinjira mu kimina. Konti n’amakuru byari bisanzwe byarabitswe.",
    "Terminez ce test avant d’ouvrir ou de rejoindre un ikimina. Les comptes et données existants sont conservés."
  ],
  "recoverAccount": [
    "Recover your account",
    "Garura konti yawe",
    "Récupérer votre compte"
  ],
  "forgotPassword": [
    "Forgot your password?",
    "Wibagiwe ijambo ry’ibanga?",
    "Mot de passe oublié ?"
  ],
  "recoveryIntro": [
    "Request a recovery code for a phone number that has completed local test confirmation.",
    "Saba kode yo kugarura konti ifite nimero yemejwe mu buryo bw’igerageza.",
    "Demandez un code pour un numéro déjà confirmé en mode test local."
  ],
  "recoveryGeneric": [
    "If this account is eligible for recovery, a local test code is available in the server terminal.",
    "Niba iyi konti yemerewe kugarurwa, kode y’igerageza iraboneka muri terminal ya seriveri.",
    "Si ce compte peut être récupéré, un code de test est disponible dans le terminal du serveur."
  ],
  "newPassword": [
    "New password",
    "Ijambo ry’ibanga rishya",
    "Nouveau mot de passe"
  ],
  "confirmPassword": [
    "Confirm new password",
    "Subiramo ijambo ry’ibanga rishya",
    "Confirmer le nouveau mot de passe"
  ],
  "setNewPassword": [
    "Set a new password",
    "Shyiraho ijambo ry’ibanga rishya",
    "Définir un nouveau mot de passe"
  ],
  "resetPassword": [
    "Reset password",
    "Hindura ijambo ry’ibanga",
    "Réinitialiser le mot de passe"
  ],
  "codeInvalid": [
    "The code is invalid, expired, already used, or has reached its attempt limit. Request another code when available.",
    "Kode ntiyemewe, yararangiye, yarakoreshejwe cyangwa wagerageje inshuro nyinshi. Saba indi kode igihe byemewe.",
    "Code invalide, expiré, déjà utilisé ou limite d’essais atteinte. Demandez un autre code dès que possible."
  ],
  "deliveryUnavailable": [
    "The local code could not be delivered. Try again later.",
    "Kode y’igerageza ntiyabonetse. Ongera ugerageze nyuma.",
    "Le code de test n’a pas pu être fourni. Réessayez plus tard."
  ],
  "phoneUnverified": [
    "Complete local phone confirmation first.",
    "Banza wemeze telefoni mu buryo bw’igerageza.",
    "Confirmez d’abord le téléphone en mode test."
  ],
  "passwordMismatch": [
    "The new passwords do not match.",
    "Amagambo y’ibanga mashya ntahura.",
    "Les nouveaux mots de passe ne correspondent pas."
  ],
  "codeRequested": [
    "Local test code requested. Check the server terminal.",
    "Kode y’igerageza yasabwe. Reba muri terminal ya seriveri.",
    "Code de test demandé. Consultez le terminal du serveur."
  ],
  "phoneConfirmed": [
    "Local test phone confirmation complete.",
    "Kwemeza telefoni mu igerageza byarangiye.",
    "Confirmation locale du téléphone terminée."
  ],
  "passwordRecovered": [
    "Password reset. Sign in with your new password. Previous sessions have been signed out.",
    "Ijambo ry’ibanga ryahinduwe. Injira ukoresheje irishya. Aho konti yari yinjiye hose yasohowe.",
    "Mot de passe réinitialisé. Connectez-vous avec le nouveau. Les anciennes sessions ont été déconnectées."
  ],
  "developmentNotice": [
    "Local development build · Verification and recovery use terminal test codes, not real SMS. Use test data only.",
    "Urubuga rw’igerageza · Kwemeza telefoni no kugarura konti bikoresha kode zo muri terminal, si SMS nyakuri. Koresha amakuru y’igerageza gusa.",
    "Développement local · Vérification et récupération par codes du terminal, sans SMS réel. Données de test uniquement."
  ],
  "localVerified": [
    "Phone confirmed in local test mode",
    "Telefoni yemejwe mu igerageza",
    "Téléphone confirmé en mode test local"
  ]
};
for(const [key,values] of Object.entries(entries))['en','rw','fr'].forEach((l,i)=>translations[l][key]=values[i]);

const limits=['Wait at least 60 seconds between codes. A maximum of three codes per purpose per hour is allowed.','Tegereza nibura amasegonda 60 hagati ya kode. Zemerewe inshuro eshatu ku gikorwa mu isaha.','Attendez au moins 60 secondes entre les codes. Maximum de trois codes par usage et par heure.'];
['en','rw','fr'].forEach((l,i)=>translations[l].codeRateLimited=limits[i]);

const noVerification={developmentNotice:['Local development build · Phone verification is disabled. Password recovery uses terminal test codes. Use test data only.','Urubuga rw’igerageza · Kwemeza telefoni byahagaritswe. Kugarura konti bikoresha kode zo muri terminal. Koresha amakuru y’igerageza gusa.','Développement local · Vérification du téléphone désactivée. Récupération du compte par codes du terminal. Données de test uniquement.'],verificationDisabled:['Phone verification is disabled.','Kwemeza telefoni byahagaritswe.','Vérification du téléphone désactivée.']};
for(const [key,values] of Object.entries(noVerification))for(const [i,lang] of ['en','rw','fr'].entries())translations[lang][key]=values[i];

for(const lang of ['en','rw','fr'])translations[lang].onlineNotice={en:'Online beta. Phone verification and password recovery are unavailable. No SMS is sent.',rw:'Igerageza kuri interineti. Nta kwemeza telefoni cyangwa kugarura ijambobanga biraboneka. Nta SMS yoherezwa.',fr:'B?ta en ligne. V?rification du t?l?phone et r?cup?ration du mot de passe indisponibles. Aucun SMS envoy?.'}[lang];
