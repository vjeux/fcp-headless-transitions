__ZN10PCBitDepth18getFromPixelFormatEN13PCPixelFormat12ChannelOrderE:
00000000000357c2	pushq	%rbp
00000000000357c3	movq	%rsp, %rbp
00000000000357c6	addl	$-0x7, %edi
00000000000357c9	xorl	%eax, %eax
00000000000357cb	cmpl	$0xa, %edi
00000000000357ce	ja	0x357dc
00000000000357d0	movl	%edi, %eax
00000000000357d2	leaq	0xee807(%rip), %rcx
00000000000357d9	movl	(%rcx,%rax,4), %eax
00000000000357dc	popq	%rbp
00000000000357dd	retq
