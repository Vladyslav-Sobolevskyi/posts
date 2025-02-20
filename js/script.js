"use strict";


const API_URL_USERS = "https://ajax.test-danit.com/api/json/users";
const API_URL_POSTS = "https://ajax.test-danit.com/api/json/posts";

let userId = 0;

const root = document.querySelector("#root");

class Loader {
    toggle(key) {
        const loader = document.querySelector("#template-loader").content.cloneNode(true);
        if (key) {
            root.before(loader);
        } else {
            document.querySelector("#loader").remove()
        }
    }
}

const loader = new Loader();
loader.toggle(true);


class API {
    constructor(urlPosts, urlUsers) {
        this.urlPosts = urlPosts;
        this.urlUsers = urlUsers;

    };

    async getPosts() {
        const response = await axios({
            method: `get`,
            url: this.urlPosts
        });
        return response.data
    };

    async getUsers() {
        const response = await axios({
            method: `get`,
            url: this.urlUsers
        });
        return response.data
    }

    async deletePosts(postId) {
        try {
            const response = await axios.delete(`${this.urlPosts}/${postId}`);
            return response.status === 200;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async editPosts (postId, title, body) {
        try {
            const response = await axios({
                method: "patch",
                url: `${this.urlPosts}/${postId}`,
                data: {
                    title: title,
                    body: body
                }
            });
            console.log(`response edit`, response.status);
            
            return response.status === 200;
        } catch (error) {
            // console.error(error)
            return false
        }
    }

    async createPost(postData) {
        try {
            const response = await axios({
                method: 'POST',
                url: this.urlPosts,
                data: {
                    body: postData.body,
                    id: postData.id,
                    title: postData.title,
                    userId: postData.userId
                },
                headers: {
                    "Content-Type": "application/json"
                }
            })
            console.log(`response new post`, response.status);
            return response.status === 200;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async createUser(userData) {
        
        try {
            const response = await axios({
                method: 'POST',
                url: this.urlUsers,
                data: {
                    email: userData.email,
                    id: userData.id,
                    name: userData.name
                },
                headers: {
                    "Content-Type": "application/json"
                }
            }) 

            console.log(`response new user`, response.status);
            return response.status === 200;
        } catch (error) {
            console.error(error)
            return false
        }
    }
}

const api = new API(API_URL_POSTS, API_URL_USERS);

class Modal {
    constructor(post, form) {
        this.post = post;
        this.form = form;

        this.modal = document.createElement("div");
        this.modal.className = "modal";

        this.modalBody = document.createElement("div");
        this.modalBody.className = "modal-body";

        this.modalBody.append(this.form);
        this.modal.append(this.modalBody);
    }

    open(callback = null) {
        root.prepend(this.modal);
        this.scrollLocker(true);
        
        

        if (this.post !== null) {
            this.form.addEventListener("submit", async (event) => {
                event.preventDefault();
                // console.log(postId);
                this.close();
                loader.toggle(true);
                const postId = this.post.id.slice(5);

                const formTitleValue = this.form.querySelector(".input-title").value;
                const formBodyValue = this.form.querySelector(".input-body").value;
                
                const postTitle = this.post.querySelector(".post-title");
                const postBody = this.post.querySelector(".post-text");
    
                const editPost = await api.editPosts(postId, formTitleValue, formBodyValue);
                if (editPost) {
                    loader.toggle(false);
                    postTitle.textContent = formTitleValue;
                    postBody.textContent = formBodyValue;
                } else {
                    loader.toggle(false);
                };
            });
        } else {
            this.form.addEventListener("submit", async (event) => {
                event.preventDefault();
                
                userId += 1;
                const newPostId = Math.floor(document.querySelector(".post").id.slice(5)) + 1;
                
                const formNameValue = this.form.querySelector(".input-name").value;
                const formEmailValue = this.form.querySelector(".input-email").value;
                const formTitleValue = this.form.querySelector(".input-title").value;
                const formBodyValue = this.form.querySelector(".input-body").value;
                
                const errorMessage = this.form.querySelector(".error-message");
                
                if (formNameValue !== "" && 
                    formEmailValue !== "" &&
                    formTitleValue !== "" &&
                    formBodyValue !== "") {
                        
                        const newPostData = {
                            id: newPostId,
                            userId: userId,
                            title: formTitleValue,
                            body: formBodyValue
                        }
                        const newUserData = {
                            id: userId,
                            name: formNameValue,
                            email: formEmailValue
                        };
        
                        const newData = [newPostData, newUserData];
                        // console.log(newData);
                        
                        if (callback) callback(newData); // Передача данных
                        this.close();
                        loader.toggle(true);
                } else {
                    
                    
                    if (errorMessage === null) {
                        const falseMessage = document.createElement("p")
                        falseMessage.textContent = "Enter all data correctly";
                        falseMessage.className = "error-message"
                        falseMessage.style.cssText = "margin: 0;padding: 16px;font-size: 14px;color: #ff5050";
                        this.form.querySelector(".input-body").after(falseMessage);
                        } 
                    
                }
                
                
            });
        };
        
        this.modal.addEventListener("click", (event) => {
            
            if (event.target.closest(".button-close") || event.target === this.modal) {
                // console.log(event.target);
                
                this.close();                
            }
        })
    };

    close() {
        this.modal.remove();
        this.scrollLocker(false);
    };

    scrollLocker(locked){
        if (locked) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = "hidden";
            document.body.style.paddingRight = `${scrollbarWidth}px`; 
        } else {
            document.body.style.overflow = "";
            document.body.style.paddingRight = ""; 
        }
    }
}

class Form {
    constructor() {
        this.form = document.createElement("form");
        this.form.className = "modal-form";

        this.nameInput = document.createElement("input");
        this.nameInput.type = "text";
        this.nameInput.classList.add("form-text", "input-name")

        this.emailInput = document.createElement("input");
        this.emailInput.type = "email";
        this.emailInput.classList.add("form-text", "input-email")

        this.titleInput = document.createElement("textarea");
        this.titleInput.classList.add("form-textarea", "input-title")

        this.bodyInput = document.createElement("textarea");
        this.bodyInput.classList.add("form-textarea", "input-body")

        this.submitBtn = document.createElement("input");
        this.submitBtn.classList.add("form-button", "button-submit");
        this.submitBtn.type = "submit";
        this.submitBtn.value = "Create Post"

        this.closeBtn = document.createElement("input");
        this.closeBtn.classList.add("form-button", "button-close");
        this.closeBtn.type = "button";
        this.closeBtn.value = "Close";

        this.buttonsTitle = document.createElement("div");
        this.buttonsTitle.className = "buttons-title"
        this.buttonsTitle.append(this.submitBtn, this.closeBtn)
    }

    newForm() {
        this.nameInput.placeholder = "enter Your name";
        this.emailInput.placeholder = "enter Your email";
        this.titleInput.placeholder = "enter post title";
        this.bodyInput.placeholder = "enter post text";
        this.form.append(this.nameInput, this.emailInput, this.titleInput, this.bodyInput, this.buttonsTitle);
        return this.form;
    };

    async editForm(title, body) {
        this.titleInput.value = title;
        this.bodyInput.value = body;
        this.form.append(this.titleInput, this.bodyInput, this.buttonsTitle);

        return this.form;
    };
};

class Post{
    constructor(post, user) {
        this.post = post;
        this.user = user;
    }

    static init() {
        const list = document.createElement("ul");
        list.id = "postsList";
        root.append(list)
    };

    render() {
        const postTemplate = document.querySelector("#post-template").content.cloneNode(true);
        // console.log(this.user.name);
        // console.log(postTemplate);
        
        const userPost = postTemplate.querySelector(".post");
        const postName = postTemplate.querySelector(".post-name");
        const postEmail = postTemplate.querySelector(".post-email");
        const postTitle = postTemplate.querySelector(".post-title");
        const postText = postTemplate.querySelector(".post-text");

        const postAvatar = postTemplate.querySelector(".post-avatar");


        userPost.id = `post-${this.post.id}`;
        postAvatar.style.backgroundColor = `#` + Math.floor(Math.random() *16777215).toString(16);        
        postName.textContent = this.user.name;
        postEmail.textContent = this.user.email;
        postTitle.textContent = this.post.title;
        postText.textContent = this.post.body;


        const deleteButton = postTemplate.querySelector(".buttons-delete");
        deleteButton.addEventListener("click", (event) => this.deletePost(event));

        const editButton = postTemplate.querySelector(".buttons-edit");
        editButton.addEventListener("click", (event) => this.editPost(event));

        document.querySelector("#postsList").prepend(postTemplate);
    }

    async deletePost(event) {
        const postElement = event.target.closest(".post");
        console.log(postElement);
        
        const deletePost = await api.deletePosts(this.post.id); 
        if (deletePost && postElement) {
            postElement.remove()
        }
    }

    async editPost(event) {
        const postElement = event.target.closest(".post");

        const postTitle = postElement.querySelector(".post-title").textContent;
        const postBody = postElement.querySelector(".post-text").textContent;

        const form = new Form();
        const editForm = await form.editForm(postTitle, postBody);
        
        const modal = new Modal(postElement, editForm)
        modal.open();
    }
}

Post.init();

class NewsFeed {
    async initLists() {
        const [posts, users] = await Promise.all([api.getPosts(), api.getUsers()]);
        loader.toggle(false);
        posts.forEach(post => {
            userId = post.userId;
            const user = users.find(user => post.userId === user.id)
            // console.log(post);
            // console.log(user);
            const cardRender = new Post(post, user);
            cardRender.render();
        });
    }

}

const feed = new NewsFeed();
feed.initLists()

document.addEventListener("DOMContentLoaded", () => {
    

    const newPostBtn = document.querySelector("#new-post");
    newPostBtn.addEventListener("click", (event) => {
        event.preventDefault();
        // console.log(event);

        const createPost = new Form();
        const newForm = createPost.newForm();
        
        const modal = new Modal(null, newForm)
        modal.open(async (newData) => {
            try {
                const [post, user] = newData;
                // console.log(user);
                // console.log(post);
                
                
                const [postAnswer, userAnswer] = await Promise.all([api.createPost(post), api.createUser(user)]);

                if(postAnswer && userAnswer) {
                    loader.toggle(false);
                    const cardRender = new Post(post, user);
                    cardRender.render();
                    // const users = await api.getUsers();
                    // console.log(users);
                } else {
                    throw new Error("Error create new post or user")
                }    
            } catch (error) {
                console.error(error)
            }
        });
        
    });
})
