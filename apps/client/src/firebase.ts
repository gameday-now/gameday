import { initializeApp } from "firebase/app"
import { GoogleAuthProvider, getAuth } from "firebase/auth"

const firebaseConfig = {
	apiKey: "AIzaSyCAs0qxSzc9Vr1K0e7In7ZuUzzuhRypOI8",
	authDomain: "ftcgameday.firebaseapp.com",
	projectId: "ftcgameday",
	storageBucket: "ftcgameday.firebasestorage.app",
	messagingSenderId: "656103181228",
	appId: "1:656103181228:web:713b79ab57fcf60415c809",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
auth.languageCode = "en"
export const googleProvider = new GoogleAuthProvider()
