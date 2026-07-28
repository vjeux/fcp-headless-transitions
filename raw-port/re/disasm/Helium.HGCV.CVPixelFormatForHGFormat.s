__ZN4HGCV24CVPixelFormatForHGFormatE8HGFormatm:
0000000000090f10	leal	-0x1(%rdi), %ecx
0000000000090f13	cmpl	$0x21, %ecx
0000000000090f16	setb	%al
0000000000090f19	movabsq	$0x1dfe0fe57, %rdx              ## imm = 0x1DFE0FE57
0000000000090f23	shrq	%cl, %rdx
0000000000090f26	testb	%dl, %al
0000000000090f28	je	0x90f35
0000000000090f2a	leaq	0x33c177(%rip), %rax
0000000000090f31	movl	(%rax,%rcx,4), %eax
0000000000090f34	retq
0000000000090f35	pushq	%rbp
0000000000090f36	movq	%rsp, %rbp
0000000000090f39	callq	__ZN13HGFormatUtils8toStringE8HGFormat ## HGFormatUtils::toString(HGFormat)
0000000000090f3e	leaq	0x84a95d(%rip), %rdi            ## literal pool for: "unsupported CoreVideo format for HGFormat %s\n"
0000000000090f45	movq	%rax, %rsi
0000000000090f48	xorl	%eax, %eax
0000000000090f4a	callq	__ZN8HGLogger7warningEPKcz      ## HGLogger::warning(char const*, ...)
0000000000090f4f	movl	$0x42475241, %eax               ## imm = 0x42475241
0000000000090f54	popq	%rbp
0000000000090f55	retq
0000000000090f56	nopw	%cs:(%rax,%rax)
