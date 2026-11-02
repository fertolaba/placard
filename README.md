# Pilchapp

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Analizar un referente con IA

`scripts/analyze-referentes.js` mira los looks de `assets/referencia/<id>/` con Gemini y deja un borrador para el seed. No modifica `referentes.ts`.

1. Revisá que `EXPO_PUBLIC_GEMINI_API_KEY` esté en `.env.local`.
2. Corré el script. El id es el nombre de la carpeta:

   ```bash
   node scripts/analyze-referentes.js rauw
   ```

   - `--all`: analiza todas las carpetas.
   - `--force`: vuelve a pedir un borrador que ya existe.
   - `--nombre "Nombre Apellido"`: obligatorio si el referente todavía no está en el seed.
   - Variable `GEMINI_MODEL`: usa otro modelo si hace falta más precisión.

3. Leé la confianza, las notas y los avisos al principio de `scripts/out/<id>.seed.txt`, y compará el borrador con las fotos.
4. Pegá a mano en `SAMPLE_REFERENTES` (`src/data/seed/referentes.ts`) lo que quieras conservar. `scripts/out/<id>.json` tiene los mismos datos normalizados, y la carpeta `scripts/out/` no se sube a git.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
