import {
    getAuth,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const auth = getAuth();
    const mainView = document.getElementById("main-view");
    const logInForm = document.getElementById("login-form");
    const loginEmail = document.getElementById("login-email");
    const loginPassword = document.getElementById("login-password");
    const loginBtn = document.getElementById("login-btn");
    const loginErrorMessage = document.getElementById("login-error-message");

    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const signUpBtn = document.getElementById("signup-btn");
    const UIErrorMessage = document.getElementById("error-message");
    const signUpFormView = document.getElementById("register-form");

    const aplicationView = document.getElementById("aplication-view");
    const UIuserEmail = document.getElementById("user-email");
    const logOutBtn = document.getElementById("logout-btn");

    onAuthStateChanged(auth, (user) => {
        console.log(user);
        if (user) {
            logInForm.style.display = "none";
            aplicationView.style.display = "block";
            UIuserEmail.innerHTML = user.email;
        } else {
            logInForm.style.display = "block";
            aplicationView.style.display = "none";
        }
        mainView.classList.remove("loading");
    });

    const signUpButtonPressed = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email.value,
                password.value
            );
            console.log(userCredential);

            await signOut(auth);

            logInForm.style.display = "block";
            aplicationView.style.display = "none";
            signUpFormView.style.display = "none";
        } catch (error) {
            console.error(error.code);
            UIErrorMessage.innerHTML = formatErrorMessage(error.code, "signup");
            UIErrorMessage.classList.add("visible");
        }
    };

    const logOutButtonPressed = async () => {
        try {
            await signOut(auth);
            loginEmail.value = "";
            loginPassword.value = "";
            email.value = "";
            password.value = "";
            logInForm.style.display = "block";
            aplicationView.style.display = "none";
            signUpFormView.style.display = "none";
        } catch (error) {
            console.error(error);
        }
    };

    const loginButtonPressed = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(
                auth,
                loginEmail.value,
                loginPassword.value);
            logInForm.style.display = "none";
        } catch (error) {
            console.error(error);
            console.log(formatErrorMessage(error.code, "login"));
            loginErrorMessage.innerHTML = formatErrorMessage(error.code, "login");
            loginErrorMessage.classList.add("visible");
        }
    };
    const showSignUpForm = () => {
        logInForm.style.display = "none";
        signUpFormView.style.display = "block";
    };

    const showLoginForm = () => {
        signUpFormView.style.display = "none"; 
        logInForm.style.display = "block"; 
    };

    signUpBtn.addEventListener("click", signUpButtonPressed);
    logOutBtn.addEventListener("click", logOutButtonPressed);
    loginBtn.addEventListener("click", loginButtonPressed);

    document.getElementById("register-link").addEventListener("click", showSignUpForm);
    document.getElementById("showLogin").addEventListener("click", showLoginForm);

    const formatErrorMessage = (errorCode, action) => {
        let message = "";
        if (action === "signup") {
            if (
                errorCode === "auth/invalid-email" ||
                errorCode === "auth/missing-email"
            ) {
                message = "El correo electrónico no es válido.";
            } else if (
                errorCode === "auth/missing-password" ||
                errorCode === "auth/weak-password"
            ) {
                message = "La contraseña es débil.";
            } else if (errorCode === "auth/email-already-in-use") {
                message = "El correo electrónico ya está en uso.";
            }
        }
        else if (action === "login") {
            if (errorCode === "auth/invalid-email") {
                message = "El correo o la contraseña son incorrectos";
            }
            else if (errorCode === "auth/user-not-found") {
                message = "El usuario no existe";
            }
        }
        return message;
    };
});