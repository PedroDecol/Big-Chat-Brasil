import { Alert, Button, Card, CardBody, CardFooter, CardHeader, Form, Input, Radio, RadioGroup } from "@heroui/react";
import axios from 'axios';
import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function IndexPage() {

  const navigate = useNavigate();

  const [CPF, setCpf] = useState('');
  const [Tipo, setTipo] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e : any) => {
    e.preventDefault();

    try{

      if (!CPF || !Tipo) {
        setError('Preencha todos os campos');
        alert('Preencha todos os campos')
        return;
      }

      const response = await axios.get('http://localhost:3003/User', {
        params: {
          CPF,
          Tipo
        }
      });

      if (response.data.length > 0){
        const user = response.data[0];
        localStorage.setItem("userId", response.data[0].id.toString());
        navigate('/ChatWindow');
      } else {
        setError('Usuario invalido');
        alert('Usuario Invalido!')
      }

    } catch (err) {
      console.error(err);
      setError('Erro ao tentar logar')
    }
  };

  return (
    <>
    <div className="grid h-screen place-items-center ">
      <Form onSubmit={handleLogin}>
        <Card className="p-10 flex-auto items-center justify-center">
          <CardHeader className="flex-auto items-center justify-center">
            Big Chat Brasil
          </CardHeader>
          <CardBody className="flex-auto items-center justify-center">
            <Input label="CPF/CNPJ" placeholder="Digite seu CPF ou CNPJ" onChange={(e) => setCpf(e.target.value)} value={CPF}></Input>
            <RadioGroup label="Tipo" orientation="horizontal" className="mt-6 flex-auto items-center justify-center text-black">
              <Radio name="tipo" value="PF" checked={Tipo === "PF"} onChange={(e) => setTipo(e.target.value)}>PF</Radio>
              <Radio name="tipo" value="PJ" checked={Tipo === "PJ"} onChange={(e) => setTipo(e.target.value)}>PJ</Radio>
            </RadioGroup>
          </CardBody>
          <CardFooter className="flex-auto items-center justify-center">
            <Button color="primary" type="submit">ENTRAR</Button>
          </CardFooter>
        </Card>
      </Form>
    </div>
    </>
  );
}
