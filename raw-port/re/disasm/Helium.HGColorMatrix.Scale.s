__ZN13HGColorMatrix5ScaleEfff:
00000000001b85f0	pushq	%rbp
00000000001b85f1	movq	%rsp, %rbp
00000000001b85f4	insertps	$0x10, %xmm1, %xmm0             ## xmm0 = xmm0[0],xmm1[0],xmm0[2,3]
00000000001b85fa	insertps	$0x20, %xmm2, %xmm0             ## xmm0 = xmm0[0,1],xmm2[0],xmm0[3]
00000000001b8600	insertps	$0x30, 0x20f6b6(%rip), %xmm0    ## xmm0 = xmm0[0,1,2],mem[0]
00000000001b860a	movaps	0x1b0(%rdi), %xmm1
00000000001b8611	mulps	%xmm0, %xmm1
00000000001b8614	movaps	%xmm1, 0x1b0(%rdi)
00000000001b861b	movaps	0x1c0(%rdi), %xmm1
00000000001b8622	mulps	%xmm0, %xmm1
00000000001b8625	movaps	%xmm1, 0x1c0(%rdi)
00000000001b862c	mulps	0x1d0(%rdi), %xmm0
00000000001b8633	movaps	%xmm0, 0x1d0(%rdi)
00000000001b863a	popq	%rbp
00000000001b863b	retq
00000000001b863c	nopl	(%rax)
