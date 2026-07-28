__ZNK14HGShaderTiling13isaccumulatorEj:
00000000000c79d0	pushq	%rbp
00000000000c79d1	movq	%rsp, %rbp
00000000000c79d4	movl	0x48(%rdi), %eax
00000000000c79d7	cmpl	%eax, %esi
00000000000c79d9	jae	0xc79e5
00000000000c79db	subl	0x4c(%rdi), %eax
00000000000c79de	cmpl	%eax, %esi
00000000000c79e0	setae	%al
00000000000c79e3	popq	%rbp
00000000000c79e4	retq
00000000000c79e5	xorl	%eax, %eax
00000000000c79e7	popq	%rbp
00000000000c79e8	retq
00000000000c79e9	nopl	(%rax)
