__ZN5HGHLG8HLGToSDRD0Ev:
00000000001008c0	pushq	%rbp
00000000001008c1	movq	%rsp, %rbp
00000000001008c4	pushq	%rbx
00000000001008c5	pushq	%rax
00000000001008c6	movq	%rdi, %rbx
00000000001008c9	leaq	0x916f30(%rip), %rax
00000000001008d0	movq	%rax, (%rdi)
00000000001008d3	movq	0x198(%rdi), %rdi
00000000001008da	testq	%rdi, %rdi
00000000001008dd	je	0x1008e5
00000000001008df	movq	(%rdi), %rax
00000000001008e2	callq	*0x18(%rax)
00000000001008e5	movq	%rbx, %rdi
00000000001008e8	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001008ed	movq	%rbx, %rdi
00000000001008f0	addq	$0x8, %rsp
00000000001008f4	popq	%rbx
00000000001008f5	popq	%rbp
00000000001008f6	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001008fb	movq	%rax, %rdi
00000000001008fe	callq	___clang_call_terminate
0000000000100903	nopw	%cs:(%rax,%rax)
