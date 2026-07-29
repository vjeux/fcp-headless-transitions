__ZNK11HGTransform10GetMatrixfEPf:
00000000001b4270	pushq	%rbp
00000000001b4271	movq	%rsp, %rbp
00000000001b4274	movupd	0x10(%rdi), %xmm0
00000000001b4279	movupd	0x20(%rdi), %xmm1
00000000001b427e	cvtpd2ps	%xmm1, %xmm1
00000000001b4282	cvtpd2ps	%xmm0, %xmm0
00000000001b4286	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
00000000001b428a	movupd	%xmm0, (%rsi)
00000000001b428e	movupd	0x30(%rdi), %xmm0
00000000001b4293	movupd	0x40(%rdi), %xmm1
00000000001b4298	cvtpd2ps	%xmm1, %xmm1
00000000001b429c	cvtpd2ps	%xmm0, %xmm0
00000000001b42a0	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
00000000001b42a4	movupd	%xmm0, 0x10(%rsi)
00000000001b42a9	movupd	0x50(%rdi), %xmm0
00000000001b42ae	movupd	0x60(%rdi), %xmm1
00000000001b42b3	cvtpd2ps	%xmm1, %xmm1
00000000001b42b7	cvtpd2ps	%xmm0, %xmm0
00000000001b42bb	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
00000000001b42bf	movupd	%xmm0, 0x20(%rsi)
00000000001b42c4	movupd	0x70(%rdi), %xmm0
00000000001b42c9	movupd	0x80(%rdi), %xmm1
00000000001b42d1	cvtpd2ps	%xmm1, %xmm1
00000000001b42d5	cvtpd2ps	%xmm0, %xmm0
00000000001b42d9	unpcklpd	%xmm1, %xmm0                    ## xmm0 = xmm0[0],xmm1[0]
00000000001b42dd	movupd	%xmm0, 0x30(%rsi)
00000000001b42e2	popq	%rbp
00000000001b42e3	retq
00000000001b42e4	nopw	%cs:(%rax,%rax)
