__ZN13HGGradeDeltaEC1Ev:
00000000000da280	pushq	%rbp
00000000000da281	movq	%rsp, %rbp
00000000000da284	pushq	%rbx
00000000000da285	pushq	%rax
00000000000da286	movq	%rdi, %rbx
00000000000da289	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000da28e	leaq	0x93267b(%rip), %rax
00000000000da295	movq	%rax, (%rbx)
00000000000da298	movabsq	$0x1358637bd, %rax              ## imm = 0x1358637BD
00000000000da2a2	movq	%rax, 0x198(%rbx)
00000000000da2a9	movq	$0x0, 0x1a0(%rbx)
00000000000da2b4	addq	$0x8, %rsp
00000000000da2b8	popq	%rbx
00000000000da2b9	popq	%rbp
00000000000da2ba	retq
00000000000da2bb	nopl	(%rax,%rax)
