__ZN10PCCurveFit20ComputeCenterTangentERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEEm:
000000000000c424	pushq	%rbp
000000000000c425	movq	%rsp, %rbp
000000000000c428	movq	(%rdx), %rax
000000000000c42b	shlq	$0x4, %rcx
000000000000c42f	movupd	-0x10(%rax,%rcx), %xmm1
000000000000c435	movupd	(%rax,%rcx), %xmm0
000000000000c43a	movupd	0x10(%rax,%rcx), %xmm2
000000000000c440	subpd	%xmm0, %xmm1
000000000000c444	subpd	%xmm2, %xmm0
000000000000c448	addpd	%xmm1, %xmm0
000000000000c44c	mulpd	0x11622c(%rip), %xmm0
000000000000c454	movapd	%xmm0, %xmm1
000000000000c458	mulpd	%xmm0, %xmm1
000000000000c45c	haddpd	%xmm1, %xmm1
000000000000c460	movq	%rdi, %rax
000000000000c463	sqrtsd	%xmm1, %xmm1
000000000000c467	movapd	0x116201(%rip), %xmm2
000000000000c46f	andpd	%xmm1, %xmm2
000000000000c473	movsd	0x1163e5(%rip), %xmm3
000000000000c47b	ucomisd	%xmm2, %xmm3
000000000000c47f	ja	0xc489
000000000000c481	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
000000000000c485	divpd	%xmm1, %xmm0
000000000000c489	movupd	%xmm0, (%rax)
000000000000c48d	popq	%rbp
000000000000c48e	retq
000000000000c48f	nop
