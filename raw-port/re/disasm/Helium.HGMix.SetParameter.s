__ZN5HGMix12SetParameterEiffff:
00000000000a6e20	pushq	%rbp
00000000000a6e21	movq	%rsp, %rbp
00000000000a6e24	testl	%esi, %esi
00000000000a6e26	je	0xa6e2f
00000000000a6e28	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000000a6e2d	popq	%rbp
00000000000a6e2e	retq
00000000000a6e2f	movq	0x198(%rdi), %rdi
00000000000a6e36	movq	(%rdi), %rax
00000000000a6e39	movq	0x60(%rax), %rax
00000000000a6e3d	xorl	%esi, %esi
00000000000a6e3f	movaps	%xmm0, %xmm1
00000000000a6e42	movaps	%xmm0, %xmm2
00000000000a6e45	movaps	%xmm0, %xmm3
00000000000a6e48	popq	%rbp
00000000000a6e49	jmpq	*%rax
00000000000a6e4b	nopl	(%rax,%rax)
