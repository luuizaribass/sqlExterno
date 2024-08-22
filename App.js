import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { supabase } from './supabaseClient';

export default function App() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [primeiroNome, setPrimeiroNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [idade, setIdade] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [sessao, setSessao] = useState(null);
  const [ehCadastro, setEhCadastro] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessao(session);
      if (session) buscarUsuarios(session.user.id);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSessao(session);
      if (session) buscarUsuarios(session.user.id);
    });
  }, []);

  const buscarUsuarios = async (userId) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setUsuarios(data);
    }
  };

  const cadastrarUsuario = async () => {
    if (primeiroNome && sobrenome && idade && sessao) {
      const { data, error } = await supabase
        .from('usuarios')
        .insert([{ 
          primeiro_nome: primeiroNome, 
          sobrenome: sobrenome, 
          idade: parseInt(idade, 10),
          user_id: sessao.user.id
        }]);

      if (error) {
        console.error(error);
      } else {
        setPrimeiroNome('');
        setSobrenome('');
        setIdade('');
        buscarUsuarios(sessao.user.id);
      }
    }
  };

  const entrarComEmail = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) alert(error.message);
  };

  const cadastrarComEmail = async () => {
    const { error } = await supabase.auth.signUp({ email, password: senha });

    if (error) alert(error.message);
  };

  const sair = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert(error.message);
    else setUsuarios([]);
  };

  if (!sessao) {
    return (
      <View style={estilos.container}>
        <Text style={estilos.titulo}>Bem-vindo ao App de Cadastro!</Text>
        <TextInput
          style={estilos.entrada}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={estilos.entrada}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
        {ehCadastro ? (
          <>
            <TouchableOpacity style={estilos.botao} onPress={cadastrarComEmail}>
              <Text style={estilos.textoBotao}>Cadastrar</Text>
            </TouchableOpacity>
            <Text onPress={() => setEhCadastro(false)} style={estilos.ligacao}>Já tem uma conta? Entrar</Text>
          </>
        ) : (
          <>
            <TouchableOpacity style={estilos.botao} onPress={entrarComEmail}>
              <Text style={estilos.textoBotao}>Entrar</Text>
            </TouchableOpacity>
            <Text onPress={() => setEhCadastro(true)} style={estilos.ligacao}>Não tem uma conta? Cadastre-se</Text>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={estilos.containerEntrada}>
      <TextInput
        style={estilos.entrada}
        placeholder="Primeiro Nome"
        value={primeiroNome}
        onChangeText={setPrimeiroNome}
      />
      <TextInput
        style={estilos.entrada}
        placeholder="Sobrenome"
        value={sobrenome}
        onChangeText={setSobrenome}
      />
      <TextInput
        style={estilos.entrada}
        placeholder="Idade"
        value={idade}
        onChangeText={setIdade}
        keyboardType="numeric"
      />
      <TouchableOpacity style={estilos.botao} onPress={cadastrarUsuario}>
        <Text style={estilos.textoBotao}>Cadastrar</Text>
      </TouchableOpacity>
      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={estilos.usuario}>
            <Text style={estilos.textoUsuario}>Nome: {item.primeiro_nome} {item.sobrenome}</Text>
            <Text style={estilos.textoUsuario}>Idade: {item.idade}</Text>
          </View>
        )}
        style={estilos.listaUsuarios}
      />
      <TouchableOpacity style={estilos.botao} onPress={sair}>
        <Text style={estilos.textoBotao}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  containerEntrada: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
    paddingTop: 110,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3949AB',
    marginBottom: 20,
  },
  entrada: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#90CAF9',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    color: '#3949AB',
  },
  botao: {
    width: '100%',
    padding: 15,
    backgroundColor: '#42A5F5',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  ligacao: {
    color: '#1E88E5',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  usuario: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#90CAF9',
  },
  textoUsuario: {
    fontSize: 16,
    color: '#3949AB',
  },
  listaUsuarios: {
    width: '100%',
    marginTop: 20,
  },  
});