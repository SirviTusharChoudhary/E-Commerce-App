import jwt from 'jsonwebtoken'

export const genToken = (custId) => {
    const token = jwt.sign({custId}, process.env.jwt_secret, {expiresIn:"15d"});
    return token;
}
