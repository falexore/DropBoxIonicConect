import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Observable } from 'rxjs/Observable';

/*
  Generated class for the DropboxProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DropboxProvider {

  accessToken: any;
  folderHistory: any = [];
  appKey: any;
  redirectURI: any;
  url: any;


  constructor(public http: HttpClient, public iab: InAppBrowser) {
    console.log('Hello DropboxProvider Provider');

    this.appKey = '3lnixewt9z3phzl';
    this.redirectURI = 'http://localhost';
    this.url = 'https://www.dropbox.com/oauth2/authorize?client_id=' + this.appKey + '&redirect_uri=' + this.redirectURI + '&response_type=token';

  }


  setAccessToken(token) {
    this.accessToken = token;
  }

  getUserInfo(){

    let headers = new HttpHeaders();

    headers.append('Authorization', 'Bearer ' + this.accessToken);
    headers.append('Content-Type', 'application/json');

    return this.http.post('https://api.dropboxapi.com/2/users/get_current_account', "null", {headers:headers})
    .map(res => res)
    
    
    // subscribe(res => {
    //  console.log(res);     
    // })



  }

  getFolders(path?){

    // let headers = new HttpHeaders();

    // headers.append('Authorization', 'Bearer ' + this.accessToken);
    // headers.append('Content-Type', 'application/json');


    const headers = !!this.accessToken ? new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+ this.accessToken
    }) : new HttpHeaders({'Content-Type': 'application/json'});

    const options = {headers: headers};


    let folderPath;

    if(typeof(path) == "undefined" || !path){

      folderPath = {
        path: ""
      };    

    } else {

      folderPath = {
        path: path
      }; 

      if(this.folderHistory[this.folderHistory.length - 1] != path){
        this.folderHistory.push(path);
      }

    }
    console.log("JSON: " +JSON.stringify(folderPath));
    
    return this.http.post('https://api.dropboxapi.com/2/files/list_folder', JSON.stringify(folderPath), options)
      .map(res =>  res );


  }

  goBackFolder(){

    if(this.folderHistory.length > 0){

      this.folderHistory.pop();
      let path = this.folderHistory[this.folderHistory.length - 1];

      return this.getFolders(path);
    }
    else {
      return this.getFolders();
    }
    
  }


  login(){

    return new Promise((resolve, reject) => {

      let browser = this.iab.create(this.url, '_blank');

      let listener = browser.on('loadstart').subscribe((event: any) => {

        //Ignore the dropbox authorize screen
        if(event.url.indexOf('oauth2/authorize') > -1){
          return;
        }

        //Check the redirect uri
        if(event.url.indexOf(this.redirectURI) > -1 ){
          listener.unsubscribe();
          browser.close();
          let token = event.url.split('=')[1].split('&')[0];
          this.accessToken = token;
          resolve(event.url);
        } else {
          reject("Could not authenticate");
        }

      });

    });

  }





}
