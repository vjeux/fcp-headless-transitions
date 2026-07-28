__ZN25HGPremultiplyWhiteToBlackD1Ev:
0000000000157fb0	pushq	%rbp
0000000000157fb1	movq	%rsp, %rbp
0000000000157fb4	pushq	%rbx
0000000000157fb5	pushq	%rax
0000000000157fb6	movq	%rdi, %rbx
0000000000157fb9	leaq	0x8c8648(%rip), %rax
0000000000157fc0	movq	%rax, (%rdi)
0000000000157fc3	movq	0x198(%rdi), %rdi
0000000000157fca	movq	(%rdi), %rax
0000000000157fcd	callq	*0x18(%rax)
0000000000157fd0	movq	%rbx, %rdi
0000000000157fd3	addq	$0x8, %rsp
0000000000157fd7	popq	%rbx
0000000000157fd8	popq	%rbp
0000000000157fd9	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000157fde	movq	%rax, %rdi
0000000000157fe1	callq	___clang_call_terminate
0000000000157fe6	nopw	%cs:(%rax,%rax)
