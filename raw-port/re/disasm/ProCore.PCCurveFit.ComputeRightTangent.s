__ZN10PCCurveFit19ComputeRightTangentERNSt3__16vectorI9PCVector2IdENS0_9allocatorIS3_EEEEm:
000000000000b5d6	pushq	%rbp
000000000000b5d7	movq	%rsp, %rbp
000000000000b5da	movq	(%rdx), %rax
000000000000b5dd	shlq	$0x4, %rcx
000000000000b5e1	movupd	-0x10(%rax,%rcx), %xmm0
000000000000b5e7	movupd	(%rax,%rcx), %xmm1
000000000000b5ec	subpd	%xmm1, %xmm0
000000000000b5f0	movapd	%xmm0, %xmm1
000000000000b5f4	mulpd	%xmm0, %xmm1
000000000000b5f8	haddpd	%xmm1, %xmm1
000000000000b5fc	movq	%rdi, %rax
000000000000b5ff	sqrtsd	%xmm1, %xmm1
000000000000b603	movapd	0x117065(%rip), %xmm2
000000000000b60b	andpd	%xmm1, %xmm2
000000000000b60f	movsd	0x117249(%rip), %xmm3
000000000000b617	ucomisd	%xmm2, %xmm3
000000000000b61b	ja	0xb625
000000000000b61d	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
000000000000b621	divpd	%xmm1, %xmm0
000000000000b625	movupd	%xmm0, (%rax)
000000000000b629	popq	%rbp
000000000000b62a	retq
000000000000b62b	nop
