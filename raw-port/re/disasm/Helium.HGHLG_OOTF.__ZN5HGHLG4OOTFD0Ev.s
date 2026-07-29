__ZN5HGHLG4OOTFD0Ev:
00000000001002c0	pushq	%rbp
00000000001002c1	movq	%rsp, %rbp
00000000001002c4	pushq	%rbx
00000000001002c5	pushq	%rax
00000000001002c6	movq	%rdi, %rbx
00000000001002c9	leaq	0x9170b0(%rip), %rax
00000000001002d0	movq	%rax, (%rdi)
00000000001002d3	movq	0x198(%rdi), %rdi
00000000001002da	testq	%rdi, %rdi
00000000001002dd	je	0x1002e5
00000000001002df	movq	(%rdi), %rax
00000000001002e2	callq	*0x18(%rax)
00000000001002e5	movq	%rbx, %rdi
00000000001002e8	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000001002ed	movq	%rbx, %rdi
00000000001002f0	addq	$0x8, %rsp
00000000001002f4	popq	%rbx
00000000001002f5	popq	%rbp
00000000001002f6	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001002fb	movq	%rax, %rdi
00000000001002fe	callq	___clang_call_terminate
0000000000100303	nopw	%cs:(%rax,%rax)
