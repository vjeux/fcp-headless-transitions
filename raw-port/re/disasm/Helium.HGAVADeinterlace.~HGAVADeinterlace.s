__ZN16HGAVADeinterlaceD0Ev:
00000000002213c0	pushq	%rbp
00000000002213c1	movq	%rsp, %rbp
00000000002213c4	pushq	%rbx
00000000002213c5	pushq	%rax
00000000002213c6	movq	%rdi, %rbx
00000000002213c9	leaq	0x810018(%rip), %rax
00000000002213d0	movq	%rax, (%rdi)
00000000002213d3	movq	0x1b0(%rdi), %rdi
00000000002213da	testq	%rdi, %rdi
00000000002213dd	je	0x2213e5
00000000002213df	movq	(%rdi), %rax
00000000002213e2	callq	*0x18(%rax)
00000000002213e5	movq	%rbx, %rdi
00000000002213e8	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000002213ed	movq	%rbx, %rdi
00000000002213f0	addq	$0x8, %rsp
00000000002213f4	popq	%rbx
00000000002213f5	popq	%rbp
00000000002213f6	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000002213fb	movq	%rax, %rdi
00000000002213fe	callq	___clang_call_terminate
0000000000221403	nopw	%cs:(%rax,%rax)
