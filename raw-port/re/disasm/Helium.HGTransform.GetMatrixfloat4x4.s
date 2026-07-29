__ZNK11HGTransform17GetMatrixfloat4x4EPN4simd8float4x4E:
00000000001b43a0	pushq	%rbp
00000000001b43a1	movq	%rsp, %rbp
00000000001b43a4	movupd	0x10(%rdi), %xmm0
00000000001b43a9	movupd	0x20(%rdi), %xmm1
00000000001b43ae	movupd	0x30(%rdi), %xmm2
00000000001b43b3	movupd	0x40(%rdi), %xmm3
00000000001b43b8	cvtpd2ps	%xmm1, %xmm1
00000000001b43bc	cvtpd2ps	%xmm0, %xmm0
00000000001b43c0	cvtpd2ps	%xmm3, %xmm3
00000000001b43c4	cvtpd2ps	%xmm2, %xmm2
00000000001b43c8	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
00000000001b43cc	unpcklpd	%xmm3, %xmm2                    ## xmm2 = xmm2[0],xmm3[0]
00000000001b43d0	movupd	0x50(%rdi), %xmm1
00000000001b43d5	movupd	0x60(%rdi), %xmm3
00000000001b43da	cvtpd2ps	%xmm3, %xmm3
00000000001b43de	cvtpd2ps	%xmm1, %xmm1
00000000001b43e2	unpcklpd	%xmm3, %xmm1                    ## xmm1 = xmm1[0],xmm3[0]
00000000001b43e6	movupd	0x80(%rdi), %xmm3
00000000001b43ee	cvtpd2ps	%xmm3, %xmm3
00000000001b43f2	movupd	0x70(%rdi), %xmm4
00000000001b43f7	cvtpd2ps	%xmm4, %xmm4
00000000001b43fb	unpcklpd	%xmm3, %xmm4                    ## xmm4 = xmm4[0],xmm3[0]
00000000001b43ff	movapd	%xmm0, (%rsi)
00000000001b4403	movapd	%xmm2, 0x10(%rsi)
00000000001b4408	movapd	%xmm1, 0x20(%rsi)
00000000001b440d	movapd	%xmm4, 0x30(%rsi)
00000000001b4412	popq	%rbp
00000000001b4413	retq
00000000001b4414	nopw	%cs:(%rax,%rax)
