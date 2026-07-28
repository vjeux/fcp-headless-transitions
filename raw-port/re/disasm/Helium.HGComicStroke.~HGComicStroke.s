__ZN13HGComicStrokeD0Ev:
0000000000170490	pushq	%rbp
0000000000170491	movq	%rsp, %rbp
0000000000170494	pushq	%rbx
0000000000170495	pushq	%rax
0000000000170496	movq	%rdi, %rbx
0000000000170499	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000017049e	movq	%rbx, %rdi
00000000001704a1	addq	$0x8, %rsp
00000000001704a5	popq	%rbx
00000000001704a6	popq	%rbp
00000000001704a7	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001704ac	nopl	(%rax)
