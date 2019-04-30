import * as jwt from 'jsonwebtoken';

export class JwtModel {

  private secretKey = process.env.SECRET_KEY;

  sign(playload: any) {
    let token = jwt.sign(playload, this.secretKey, {
      expiresIn: '1d'
    });
    return token;
  }

  signApiKey(playload: any) {
    let token = jwt.sign(playload, this.secretKey, {
      expiresIn: '1y'
    });
    return token;
  }

  verify(token: string) {
    return jwt.verify(token, this.secretKey);
  }

}
