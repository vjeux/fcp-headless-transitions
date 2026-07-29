__ZN11HGTransform9TransposeEv:
00000000001b6880	pushq	%rbp
00000000001b6881	movq	%rsp, %rbp
00000000001b6884	movsd	0x18(%rdi), %xmm0
00000000001b6889	cvtsd2ss	%xmm0, %xmm0
00000000001b688d	movsd	0x30(%rdi), %xmm1
00000000001b6892	movsd	%xmm1, 0x18(%rdi)
00000000001b6897	cvtss2sd	%xmm0, %xmm0
00000000001b689b	movsd	%xmm0, 0x30(%rdi)
00000000001b68a0	movsd	0x50(%rdi), %xmm0
00000000001b68a5	movsd	0x20(%rdi), %xmm1
00000000001b68aa	movsd	%xmm0, 0x20(%rdi)
00000000001b68af	movsd	0x70(%rdi), %xmm0
00000000001b68b4	movsd	0x28(%rdi), %xmm2
00000000001b68b9	movsd	%xmm0, 0x28(%rdi)
00000000001b68be	movhpd	0x40(%rdi), %xmm1               ## xmm1 = xmm1[0],mem[0]
00000000001b68c3	movsd	0x58(%rdi), %xmm0
00000000001b68c8	movsd	%xmm0, 0x40(%rdi)
00000000001b68cd	cvtpd2ps	%xmm1, %xmm0
00000000001b68d1	cvtps2pd	%xmm0, %xmm0
00000000001b68d4	movups	%xmm0, 0x50(%rdi)
00000000001b68d8	movsd	0x78(%rdi), %xmm0
00000000001b68dd	movhpd	0x48(%rdi), %xmm2               ## xmm2 = xmm2[0],mem[0]
00000000001b68e2	cvtpd2ps	%xmm2, %xmm1
00000000001b68e6	movsd	%xmm0, 0x48(%rdi)
00000000001b68eb	cvtps2pd	%xmm1, %xmm0
00000000001b68ee	movups	%xmm0, 0x70(%rdi)
00000000001b68f2	movsd	0x68(%rdi), %xmm0
00000000001b68f7	movsd	0x80(%rdi), %xmm1
00000000001b68ff	cvtsd2ss	%xmm0, %xmm0
00000000001b6903	movsd	%xmm1, 0x68(%rdi)
00000000001b6908	cvtss2sd	%xmm0, %xmm0
00000000001b690c	movsd	%xmm0, 0x80(%rdi)
00000000001b6914	popq	%rbp
00000000001b6915	retq
00000000001b6916	nopw	%cs:(%rax,%rax)
