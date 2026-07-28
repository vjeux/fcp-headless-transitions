__ZN18HGCColorGamma_biasD0Ev:
00000000000fd4f0	pushq	%rbp
00000000000fd4f1	movq	%rsp, %rbp
00000000000fd4f4	pushq	%rbx
00000000000fd4f5	pushq	%rax
00000000000fd4f6	movq	%rdi, %rbx
00000000000fd4f9	callq	__ZN18HgcColorGamma_biasD2Ev    ## HgcColorGamma_bias::~HgcColorGamma_bias()
00000000000fd4fe	movq	%rbx, %rdi
00000000000fd501	addq	$0x8, %rsp
00000000000fd505	popq	%rbx
00000000000fd506	popq	%rbp
00000000000fd507	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000fd50c	nopl	(%rax)
