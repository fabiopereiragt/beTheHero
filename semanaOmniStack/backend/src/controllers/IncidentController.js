const connection = require("../database/connection");

module.exports = {
  async index(request, response) {
    const { page = 1 } = request.query; //coloco entre chaves pq o retorno do request.query é um array, colocando entre chaves ele me retorna diretamente em uma variável o valor. Se não vier valor, inicio com o valor 1.

    const [count] = await connection("incidents").count();
    const incidents = await connection("incidents")
      .join("ongs", "ongs.id", "=", "incidents.ong_id")
      .limit(5)
      .offset((page - 1) * 5)
      .select([
        "incidents.*",
        "ongs.name",
        "ongs.email",
        "ongs.whatsapp",
        "ongs.city",
        "ongs.uf"
      ]);

    /*console.log(count);
    console.log(count['count(*)']);*/

    response.header("X-Total-Count", count["count(*)"]); //Verificar a linha comentada anterior para ver o porquê que é enviado count['count(*)']

    return response.json(incidents);
  },

  async create(request, response) {
    const { title, description, value } = request.body;

    const ong_id = request.headers.authorization; //authorization vem no header da requisição feita pelo front. O nome desse valor tem que ser igual enviado no header

    const [id] = await connection("incidents").insert({
      title,
      description,
      value,
      ong_id
    });
    return response.json({ id }); //Envio entre chaves para que o nome do atributo apareça como id = 333, pois se enviar só o id o usuário não vai saber o que é.
  },

  async delete(request, response) {
    const { id } = request.params; //id passado por parâmetro
    const ong_id = request.headers.authorization; //busca a ong logada na session

    const incident = await connection("incidents")
      .where("id", id)
      .select("ong_id") //busca a ong referente ao id do incident informado para comparar se são iguais
      .first();

    if (incident.ong_id != ong_id) {
      return response.status(401).json({ error: "Operation not permitted." });
    }

    await connection("incidents")
      .where("id", id)
      .delete();

    return response.status(204).send(); //204 retorno sem conteúdo. Resposta de sucesso sem conteúdo pra mostrar
  }
};
