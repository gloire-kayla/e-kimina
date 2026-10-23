import {translations} from './i18n.mjs';
const entries={
  "dues": [
    "Dues & deadlines",
    "Imisanzu n’igihe cyo kwishyura",
    "Échéances"
  ],
  "duesSub": [
    "Confirmed payments determine what is still due.",
    "Ubwishyu bwemejwe bugaragaza asigaye kwishyurwa.",
    "Les paiements confirmés déterminent les sommes dues."
  ],
  "contributionDues": [
    "Contribution schedule",
    "Ingengabihe y’imisanzu",
    "Échéancier des cotisations"
  ],
  "loanDues": [
    "Loan installments",
    "Ubwishyu bw’inguzanyo",
    "Échéances des prêts"
  ],
  "expected": [
    "Expected",
    "Ateganyijwe",
    "Attendu"
  ],
  "paid": [
    "Paid",
    "Yishyuwe",
    "Payé"
  ],
  "remainingDue": [
    "Still due",
    "Asigaye kwishyurwa",
    "Restant dû"
  ],
  "overdue": [
    "Overdue",
    "Byarengeje igihe",
    "En retard"
  ],
  "due": [
    "Due today",
    "Bigomba kwishyurwa uyu munsi",
    "Dû aujourd’hui"
  ],
  "upcoming": [
    "Upcoming",
    "Igihe ntikiragera",
    "À venir"
  ],
  "partial": [
    "Partially paid",
    "Yishyuwe igice",
    "Partiellement payé"
  ],
  "deadline": [
    "Deadline",
    "Itariki ntarengwa",
    "Date limite"
  ],
  "installmentNumber": [
    "Installment",
    "Icyiciro cy’ubwishyu",
    "Échéance"
  ],
  "overdueContributions": [
    "Overdue contributions",
    "Imisanzu yarengeje igihe",
    "Cotisations en retard"
  ],
  "overdueLoans": [
    "Overdue loan installments",
    "Ubwishyu bw’inguzanyo bwarengeje igihe",
    "Prêts en retard"
  ],
  "overdueOnly": [
    "Overdue only",
    "Ibyarengeje igihe gusa",
    "Retards uniquement"
  ],
  "allDues": [
    "All deadlines",
    "Amatariki yose",
    "Toutes les échéances"
  ],
  "trackingOff": [
    "Contribution tracking is not enabled. The chairperson can enable it in Group settings.",
    "Gukurikirana imisanzu ntibirafungurwa. Perezida ashobora kubifungura mu mategeko y’ikimina.",
    "Le suivi des cotisations est désactivé. Le président peut l’activer dans les règles du groupe."
  ],
  "trackContributions": [
    "Track monthly contributions",
    "Kurikirana imisanzu ya buri kwezi",
    "Suivre les cotisations mensuelles"
  ],
  "dueDay": [
    "Contribution due day (1–31)",
    "Umunsi ntarengwa wo gutanga umusanzu (1–31)",
    "Jour d’échéance (1–31)"
  ],
  "trackingStart": [
    "First month / next rule month",
    "Ukwezi kwa mbere / ukwezi kw’amategeko mashya",
    "Premier mois / mois des nouvelles règles"
  ],
  "planHelp": [
    "Existing dues keep their original amount and deadline. Active schedule changes start next month. New members joining after a deadline start the following month. Excess payments stay with the selected month; they do not automatically pay another month.",
    "Imisanzu isanzwe igumana amafaranga n’itariki byayo. Impinduka zitangira ukwezi gutaha. Uwinjiye nyuma y’itariki ntarengwa atangira ukwezi gukurikiraho. Ayarenze aguma ku kwezi kwatoranyijwe; ntiyimurwa ku kundi kwezi.",
    "Les échéances existantes conservent montant et date. Les changements prennent effet le mois suivant. Une adhésion après l’échéance débute le mois suivant. Un excédent reste affecté au mois choisi."
  ],
  "invalidTracking": [
    "Choose a due day from 1–31. First-time tracking must start this month or within the next 12 months.",
    "Hitamo umunsi kuva kuri 1 kugeza kuri 31. Gukurikirana bwa mbere bitangira uku kwezi cyangwa mu mezi 12 akurikira.",
    "Choisissez un jour de 1 à 31. Le premier suivi doit débuter ce mois-ci ou dans les 12 mois suivants."
  ],
  "receiptFile": [
    "Receipt (optional)",
    "Inyemezabwishyu (si ngombwa)",
    "Justificatif (facultatif)"
  ],
  "receiptHelp": [
    "PNG, JPEG, WebP or PDF, up to 5 MB. A receipt supports a notice; the treasurer must still confirm receiving the money.",
    "PNG, JPEG, WebP cyangwa PDF bitarengeje MB 5. Inyemezabwishyu iherekeza imenyesha; umubitsi agomba kwemeza ko amafaranga yakiriwe.",
    "PNG, JPEG, WebP ou PDF, 5 Mo maximum. Le justificatif ne remplace pas la confirmation de réception par le trésorier."
  ],
  "viewReceipt": [
    "Download receipt",
    "Kuramo inyemezabwishyu",
    "Télécharger le justificatif"
  ],
  "receiptType": [
    "Choose a PNG, JPEG, WebP or PDF whose file type matches its extension.",
    "Hitamo PNG, JPEG, WebP cyangwa PDF bihuye n’ubwoko bwa dosiye.",
    "Choisissez un PNG, JPEG, WebP ou PDF dont le contenu correspond à l’extension."
  ],
  "receiptTooLarge": [
    "Choose a non-empty receipt file no larger than 5 MB.",
    "Hitamo dosiye irimo amakuru itarengeje MB 5.",
    "Choisissez un fichier non vide de 5 Mo maximum."
  ],
  "receiptQuota": [
    "Receipt storage or upload limit reached. Try later or contact the group leader.",
    "Umubare cyangwa ububiko bw’inyemezabwishyu bwageze ku rugero. Gerageza nyuma cyangwa uvugane n’umuyobozi.",
    "Limite d’envoi ou de stockage atteinte. Réessayez plus tard ou contactez le responsable."
  ],
  "invalidReceipt": [
    "This receipt is unavailable or already attached. Refresh and check the payment records.",
    "Iyi nyemezabwishyu ntiboneka cyangwa yamaze gufatanywa n’ubwishyu. Ongera urebe inyandiko.",
    "Ce justificatif est indisponible ou déjà associé. Actualisez et vérifiez les paiements."
  ],
  "reversed": [
    "Reversed",
    "Byakosowe",
    "Contrepassé"
  ],
  "reverseRecord": [
    "Correct record",
    "Kosora inyandiko",
    "Corriger l’écriture"
  ],
  "reverseTitle": [
    "Reverse an incorrect record",
    "Kosora inyandiko itari yo",
    "Contrepasser une écriture incorrecte"
  ],
  "reverseHelp": [
    "Creates a linked correction and preserves the original record. This does not transfer money outside e-Kimina. Disbursements with unreversed repayments cannot be reversed.",
    "Hongerwaho inyandiko y’ikosora, iya mbere ikagumaho. Ibi ntibyohereza amafaranga hanze ya e-Kimina. Inguzanyo ifite ubwishyu butarakosorwa ntishobora gukurwaho.",
    "Crée une contre-écriture liée sans supprimer l’original. Aucun transfert externe. Un décaissement ayant des remboursements non annulés ne peut pas être contrepassé."
  ],
  "reverseConfirm": [
    "I confirm that this recorded transaction is incorrect.",
    "Ndemeza ko iyi nyandiko y’ubwishyu itari yo.",
    "Je confirme que cette écriture est incorrecte."
  ],
  "reverseSubmit": [
    "Record the reversal",
    "Andika ikosora",
    "Enregistrer la contrepassation"
  ],
  "reversalSaved": [
    "Linked reversal recorded.",
    "Ikosora ryanditswe.",
    "Contrepassation liée enregistrée."
  ],
  "invalidReversal": [
    "This record cannot be reversed. Check its type and any repayments.",
    "Iyi nyandiko ntishobora gukosorwa gutya. Reba ubwoko bwayo n’ubwishyu bujyanye na yo.",
    "Cette écriture ne peut pas être contrepassée. Vérifiez son type et les remboursements."
  ],
  "alreadyReversed": [
    "This record already has a reversal.",
    "Iyi nyandiko yamaze gukosorwa.",
    "Cette écriture a déjà été contrepassée."
  ],
  "reconciliation": [
    "Balance checks",
    "Kugenzura amafaranga",
    "Rapprochement des soldes"
  ],
  "reconciliationHelp": [
    "Compare total funds counted outside e-Kimina with the recorded balance. Differences are recorded for review and do not change financial balances automatically.",
    "Gereranya amafaranga abazwe hanze ya e-Kimina n’ayanditswe. Ikinyuranyo kirandikwa kigasesengurwa; ntigihita gihindura amafaranga mu bitabo.",
    "Comparez les fonds constatés hors d’e-Kimina au solde enregistré. Les écarts sont consignés sans ajustement automatique des comptes."
  ],
  "recordBalanceCheck": [
    "Record a balance check",
    "Andika igenzura ry’amafaranga",
    "Enregistrer un rapprochement"
  ],
  "countedCash": [
    "Cash counted (RWF)",
    "Amafaranga mu ntoki yabazwe (RWF)",
    "Espèces constatées (RWF)"
  ],
  "countedMomo": [
    "Mobile Money balance (RWF)",
    "Amafaranga kuri Mobile Money (RWF)",
    "Solde Mobile Money (RWF)"
  ],
  "countedBank": [
    "Bank balances (RWF)",
    "Amafaranga muri banki (RWF)",
    "Soldes bancaires (RWF)"
  ],
  "observedTotal": [
    "Counted total",
    "Ayabazwe yose",
    "Total constaté"
  ],
  "recordedBalance": [
    "Recorded balance",
    "Amafaranga yanditswe",
    "Solde enregistré"
  ],
  "difference": [
    "Difference",
    "Ikinyuranyo",
    "Écart"
  ],
  "notes": [
    "Notes / explanation",
    "Ibisobanuro",
    "Notes / explication"
  ],
  "reconciliationSaved": [
    "Balance check saved; no financial balance was changed.",
    "Igenzura ryabitswe; amafaranga mu bitabo ntiyahindutse.",
    "Rapprochement enregistré ; aucun solde comptable modifié."
  ],
  "markRead": [
    "Mark shown items as read",
    "Emeza ko wasomye ibi bigaragara",
    "Marquer les éléments affichés comme lus"
  ],
  "inboxHelp": [
    "In-app notices only. SMS and push delivery are not connected.",
    "Imenyesha ryo ku rubuga gusa. SMS n’ubutumwa bwa push ntibirahuzwa.",
    "Notifications dans le site uniquement. SMS et push non connectés."
  ],
  "paymentStatus": [
    "Payment review",
    "Isuzuma ry’ubwishyu",
    "Décision sur le paiement"
  ],
  "paymentReversed": [
    "Payment record corrected",
    "Inyandiko y’ubwishyu yakosowe",
    "Paiement contrepassé"
  ],
  "reviewPayment": [
    "Payment awaiting your confirmation",
    "Ubwishyu butegereje ko ubyemeza",
    "Paiement à confirmer"
  ],
  "loanStatus": [
    "Loan application update",
    "Amakuru ku busabe bw’inguzanyo",
    "Mise à jour du prêt"
  ],
  "reviewLoan": [
    "Loan application awaiting review",
    "Ubusabe bw’inguzanyo butegereje isuzuma",
    "Demande de prêt à examiner"
  ],
  "loanDisbursed": [
    "External disbursement confirmed",
    "Itangwa ry’inguzanyo hanze ryemejwe",
    "Décaissement externe confirmé"
  ],
  "loanDue": [
    "Loan installment due",
    "Ubwishyu bw’inguzanyo bugomba gutangwa",
    "Échéance de prêt à payer"
  ],
  "contributionDue": [
    "Contribution due",
    "Umusanzu ugomba gutangwa",
    "Cotisation à payer"
  ],
  "reversedEvent": [
    "Record reversed",
    "Inyandiko yakosowe",
    "Écriture contrepassée"
  ],
  "reconciledEvent": [
    "Balance check recorded",
    "Igenzura ry’amafaranga ryanditswe",
    "Rapprochement enregistré"
  ],
  "credit": [
    "Extra paid for this month",
    "Ayishyuwe arenze ay’uku kwezi",
    "Excédent affecté à ce mois"
  ],
  "netActivity": [
    "Net confirmed contributions, including corrections",
    "Imisanzu yemejwe harimo n’amakosora",
    "Cotisations nettes confirmées, corrections comprises"
  ]
};
for(const [key,values] of Object.entries(entries))['en','rw','fr'].forEach((l,i)=>translations[l][key]=values[i]);
const announcements={"announcements":["Group announcements","Amatangazo y’ikimina","Annonces du groupe"],"publishAnnouncement":["Post an announcement","Tanga itangazo","Publier une annonce"],"announcementTitle":["Title","Umutwe","Titre"],"announcementBody":["Message","Ubutumwa","Message"],"announcementSaved":["Announcement posted to the group.","Itangazo ryashyizwe mu kimina.","Annonce publiée dans le groupe."],"announcement":["Group announcement","Itangazo ry’ikimina","Annonce du groupe"],"announcementEvent":["Announcement published","Itangazo ryatanzwe","Annonce publiée"]};
for(const [key,values] of Object.entries(announcements))['en','rw','fr'].forEach((l,i)=>translations[l][key]=values[i]);
