# Online pilot deployment

This is preparation for an online beta, not evidence of a live deployment. No hosting account has been connected and no resources or charges have been created. Local website data is not automatically uploaded. Use fictional records for the first hosted acceptance test.

## Estimated pilot cost

Checked 27 October 2026 against [Render pricing](https://render.com/pricing): the smallest paid 512 MB web service is US$7/month, a 1 GB persistent disk is US$0.25/month, and the Hobby workspace is US$0/month. The estimated base total is US$7.25/month before taxes, extra bandwidth/build usage or optional services. This is one shared website/API service, not a per-app-user fee. Check the actual dashboard quote before deploying. SMS, domain registration and independent backup storage are separate.

## Hosting configuration

The example `render.yaml` uses the public source backup repository at `https://github.com/gloire-kayla/e-kimina`. The Blueprint path is `e-kimina/render.yaml`, and the service root is `e-kimina`. Review the current paid service and 1 GB persistent-disk charges in the hosting dashboard before applying the Blueprint. Automatic deployments are disabled.

The service runs Node 24, serves both website and API, and stores SQLite (including receipt data) at `/var/data/e-kimina.sqlite`. Run one instance only. The service must be reachable exclusively through the hosting provider's HTTPS ingress. A disk is essential: an ephemeral filesystem loses account and group data after replacement/redeployment. See [Render disks](https://render.com/docs/disks) and the [Blueprint reference](https://render.com/docs/blueprint-spec).

`DEPLOYMENT_MODE=public-beta` explicitly enables remote requests. `APP_ORIGIN` must be the exact HTTPS origin, without a trailing slash. Render's `RENDER_EXTERNAL_URL` supplies the default if `APP_ORIGIN` is not set. A custom domain requires updating `APP_ORIGIN` and rebuilding the mobile app against that origin. Host, Origin and CSRF checks and Secure/HttpOnly cookies stay enforced. Do not allow arbitrary origins or credentialed wildcard CORS.

`TRUSTED_PROXY_HOPS=0` ignores forwarded client-IP headers and uses the socket address for rate limits. This is deliberately conservative and can share the 30-attempt/15-minute IP limit among users behind the ingress. Before wider testing, confirm the provider's actual proxy chain and isolate the backend network, then configure the exact trusted hop count (1-5). Do not guess a hop count or trust client-supplied headers directly.

Phone verification remains disabled. Password recovery is disabled in online mode because no delivery provider exists. No recovery codes are written to hosting logs or returned in API responses. Do not promise SMS or self-service recovery to beta testers. A real delivery channel is a separate integration.

## Deployment and acceptance

1. Push the prepared public source changes to GitHub, then connect the hosting account to the repository. Confirm the paid plan and disk before deployment.
2. Apply the reviewed configuration. Check `/api/health`: expect `stage=public-beta`, `accountRecovery=disabled` and `smsDelivery=disabled`. Verify the HTTPS origin, certificate and website registration/sign-in from another network.
3. Use fictional accounts to test group creation, invitations, treasurer approval, loans, member privacy and receipt access on the deployed service. Verify cookies are Secure/HttpOnly and wrong Host/Origin/CSRF requests fail.
4. Redeploy/restart once and confirm the fictional records survive. Test database backup and restoration before using important records. Run `DATABASE_PATH=/var/data/e-kimina.sqlite node scripts/backup.mjs /var/data/backups/UNIQUE-NAME.sqlite` in the service shell, download the SQLite backup to private storage, and restore into a separate test service. Files on the same disk alone are not an independent backup.
5. Once the actual HTTPS URL works, build the mobile APK from PowerShell:

   ```powershell
   $env:EXPO_PUBLIC_API_URL='https://ACTUAL-HOSTNAME'
   .\Build-Android-APK.cmd
   ```

   Replace the placeholder with the verified service origin. Install on the Pixel, unplug USB, disable Wi-Fi, and test over mobile data. Test another phone before sharing. Until these checks pass, the existing APK remains the local USB build.

The APK still uses an internal test signing key. Store distribution needs a private release key and a separate release process. Public hosting does not add automatic payment processing, profit distribution, loan restructuring, push delivery or SMS. A hosted beta is not a complete operational or security review for a financial service.
