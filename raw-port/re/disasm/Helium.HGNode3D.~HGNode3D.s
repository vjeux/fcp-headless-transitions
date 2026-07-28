__ZN8HGNode3DD0Ev:
0000000000122260	pushq	%rbp
0000000000122261	movq	%rsp, %rbp
0000000000122264	pushq	%rbx
0000000000122265	pushq	%rax
0000000000122266	movq	%rdi, %rbx
0000000000122269	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000012226e	movq	%rbx, %rdi
0000000000122271	addq	$0x8, %rsp
0000000000122275	popq	%rbx
0000000000122276	popq	%rbp
0000000000122277	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000012227c	nopl	(%rax)
