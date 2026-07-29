__ZNK11HGTransform7ProjectEPfii:
00000000001b59d0	pushq	%rbp
00000000001b59d1	movq	%rsp, %rbp
00000000001b59d4	cvtsi2sd	%edx, %xmm0
00000000001b59d8	movddup	%xmm0, %xmm1                    ## xmm1 = xmm0[0,0]
00000000001b59dc	mulsd	0x28(%rdi), %xmm0
00000000001b59e1	cvtsi2sd	%ecx, %xmm2
00000000001b59e5	movddup	%xmm2, %xmm3                    ## xmm3 = xmm2[0,0]
00000000001b59e9	mulsd	0x48(%rdi), %xmm2
00000000001b59ee	addsd	%xmm0, %xmm2
00000000001b59f2	addsd	0x88(%rdi), %xmm2
00000000001b59fa	movupd	0x10(%rdi), %xmm0
00000000001b59ff	mulpd	%xmm1, %xmm0
00000000001b5a03	movupd	0x30(%rdi), %xmm1
00000000001b5a08	movupd	0x70(%rdi), %xmm4
00000000001b5a0d	mulpd	%xmm3, %xmm1
00000000001b5a11	addpd	%xmm0, %xmm1
00000000001b5a15	addpd	%xmm4, %xmm1
00000000001b5a19	movddup	%xmm2, %xmm0                    ## xmm0 = xmm2[0,0]
00000000001b5a1d	divpd	%xmm0, %xmm1
00000000001b5a21	cvtpd2ps	%xmm1, %xmm0
00000000001b5a25	movlpd	%xmm0, (%rsi)
00000000001b5a29	popq	%rbp
00000000001b5a2a	retq
00000000001b5a2b	nopl	(%rax,%rax)
