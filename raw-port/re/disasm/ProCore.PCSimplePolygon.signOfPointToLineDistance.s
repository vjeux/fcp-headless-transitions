__ZNK15PCSimplePolygon25signOfPointToLineDistanceERK9PCVector2IdES3_S3_:
00000000000c3e68	pushq	%rbp
00000000000c3e69	movq	%rsp, %rbp
00000000000c3e6c	movupd	(%rsi), %xmm0
00000000000c3e70	movupd	(%rcx), %xmm1
00000000000c3e74	subpd	%xmm0, %xmm1
00000000000c3e78	shufpd	$0x1, %xmm1, %xmm1              ## xmm1 = xmm1[1,0]
00000000000c3e7d	movupd	(%rdx), %xmm2
00000000000c3e81	subpd	%xmm0, %xmm2
00000000000c3e85	mulpd	%xmm1, %xmm2
00000000000c3e89	hsubpd	%xmm2, %xmm2
00000000000c3e8d	movsd	0x5e713(%rip), %xmm0
00000000000c3e95	xorl	%ecx, %ecx
00000000000c3e97	ucomisd	%xmm2, %xmm0
00000000000c3e9b	seta	%cl
00000000000c3e9e	negl	%ecx
00000000000c3ea0	ucomisd	0x5e9e8(%rip), %xmm2
00000000000c3ea8	movl	$0x1, %eax
00000000000c3ead	cmovbel	%ecx, %eax
00000000000c3eb0	popq	%rbp
00000000000c3eb1	retq
