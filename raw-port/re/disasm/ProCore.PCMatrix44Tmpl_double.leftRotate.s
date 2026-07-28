__ZN14PCMatrix44TmplIdE10leftRotateEdNS0_4axisE:
000000000004fa14	xorpd	%xmm1, %xmm1
000000000004fa18	ucomisd	%xmm1, %xmm0
000000000004fa1c	jne	0x4fa21
000000000004fa1e	jp	0x4fa21
000000000004fa20	retq
000000000004fa21	pushq	%rbp
000000000004fa22	movq	%rsp, %rbp
000000000004fa25	pushq	%r14
000000000004fa27	pushq	%rbx
000000000004fa28	movl	%esi, %r14d
000000000004fa2b	movapd	%xmm0, %xmm2
000000000004fa2f	movq	%rdi, %rbx
000000000004fa32	movsd	0xd5cee(%rip), %xmm4
000000000004fa3a	subsd	%xmm0, %xmm4
000000000004fa3e	andpd	0xd2c2a(%rip), %xmm4
000000000004fa46	movsd	0xd2ae2(%rip), %xmm0
000000000004fa4e	movsd	0xd2e2a(%rip), %xmm3
000000000004fa56	ucomisd	%xmm4, %xmm3
000000000004fa5a	ja	0x4fb0b
000000000004fa60	movsd	0xd3b18(%rip), %xmm4
000000000004fa68	subsd	%xmm2, %xmm4
000000000004fa6c	andpd	0xd2bfc(%rip), %xmm4
000000000004fa74	ucomisd	%xmm4, %xmm3
000000000004fa78	ja	0x4fb0b
000000000004fa7e	movsd	0xd2aea(%rip), %xmm4
000000000004fa86	subsd	%xmm2, %xmm4
000000000004fa8a	andpd	0xd2bde(%rip), %xmm4
000000000004fa92	movsd	0xd2fd6(%rip), %xmm0
000000000004fa9a	ucomisd	%xmm4, %xmm3
000000000004fa9e	ja	0x4fb0b
000000000004faa0	movsd	0xd5c88(%rip), %xmm4
000000000004faa8	subsd	%xmm2, %xmm4
000000000004faac	andpd	0xd2bbc(%rip), %xmm4
000000000004fab4	ucomisd	%xmm4, %xmm3
000000000004fab8	ja	0x4fb0b
000000000004faba	movsd	0xd5c4e(%rip), %xmm4
000000000004fac2	subsd	%xmm2, %xmm4
000000000004fac6	andpd	0xd2ba2(%rip), %xmm4
000000000004face	xorpd	%xmm0, %xmm0
000000000004fad2	movsd	0xd2f96(%rip), %xmm1
000000000004fada	ucomisd	%xmm4, %xmm3
000000000004fade	ja	0x4fb0b
000000000004fae0	movsd	0xd2ab8(%rip), %xmm4
000000000004fae8	subsd	%xmm2, %xmm4
000000000004faec	andpd	0xd2b7c(%rip), %xmm4
000000000004faf4	ucomisd	%xmm4, %xmm3
000000000004faf8	ja	0x4fb0b
000000000004fafa	movapd	%xmm2, %xmm0
000000000004fafe	callq	0xde738                         ## symbol stub for: ___sincos_stret
000000000004fb03	xorpd	0x92565(%rip), %xmm0
000000000004fb0b	testl	%r14d, %r14d
000000000004fb0e	je	0x4fc07
000000000004fb14	cmpl	$0x1, %r14d
000000000004fb18	je	0x4fb97
000000000004fb1a	cmpl	$0x2, %r14d
000000000004fb1e	jne	0x4fc77
000000000004fb24	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
000000000004fb28	movupd	(%rbx), %xmm2
000000000004fb2c	movupd	0x10(%rbx), %xmm3
000000000004fb31	movupd	0x20(%rbx), %xmm4
000000000004fb36	movupd	0x30(%rbx), %xmm5
000000000004fb3b	movapd	%xmm1, %xmm6
000000000004fb3f	mulpd	%xmm2, %xmm6
000000000004fb43	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
000000000004fb47	movapd	%xmm0, %xmm7
000000000004fb4b	mulpd	%xmm4, %xmm7
000000000004fb4f	addpd	%xmm6, %xmm7
000000000004fb53	movupd	%xmm7, (%rbx)
000000000004fb57	movapd	%xmm1, %xmm6
000000000004fb5b	mulpd	%xmm3, %xmm6
000000000004fb5f	movapd	%xmm0, %xmm7
000000000004fb63	mulpd	%xmm5, %xmm7
000000000004fb67	addpd	%xmm6, %xmm7
000000000004fb6b	movupd	%xmm7, 0x10(%rbx)
000000000004fb70	mulpd	%xmm1, %xmm4
000000000004fb74	mulpd	%xmm0, %xmm2
000000000004fb78	subpd	%xmm2, %xmm4
000000000004fb7c	movupd	%xmm4, 0x20(%rbx)
000000000004fb81	mulpd	%xmm5, %xmm1
000000000004fb85	mulpd	%xmm3, %xmm0
000000000004fb89	subpd	%xmm0, %xmm1
000000000004fb8d	movupd	%xmm1, 0x30(%rbx)
000000000004fb92	jmp	0x4fc77
000000000004fb97	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
000000000004fb9b	movupd	(%rbx), %xmm2
000000000004fb9f	movupd	0x10(%rbx), %xmm3
000000000004fba4	movupd	0x40(%rbx), %xmm4
000000000004fba9	movupd	0x50(%rbx), %xmm5
000000000004fbae	movapd	%xmm1, %xmm6
000000000004fbb2	mulpd	%xmm2, %xmm6
000000000004fbb6	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
000000000004fbba	movapd	%xmm0, %xmm7
000000000004fbbe	mulpd	%xmm4, %xmm7
000000000004fbc2	subpd	%xmm7, %xmm6
000000000004fbc6	movupd	%xmm6, (%rbx)
000000000004fbca	movapd	%xmm1, %xmm6
000000000004fbce	mulpd	%xmm3, %xmm6
000000000004fbd2	movapd	%xmm0, %xmm7
000000000004fbd6	mulpd	%xmm5, %xmm7
000000000004fbda	subpd	%xmm7, %xmm6
000000000004fbde	movupd	%xmm6, 0x10(%rbx)
000000000004fbe3	mulpd	%xmm1, %xmm4
000000000004fbe7	mulpd	%xmm0, %xmm2
000000000004fbeb	addpd	%xmm4, %xmm2
000000000004fbef	movupd	%xmm2, 0x40(%rbx)
000000000004fbf4	mulpd	%xmm5, %xmm1
000000000004fbf8	mulpd	%xmm3, %xmm0
000000000004fbfc	addpd	%xmm1, %xmm0
000000000004fc00	movupd	%xmm0, 0x50(%rbx)
000000000004fc05	jmp	0x4fc77
000000000004fc07	movddup	%xmm1, %xmm1                    ## xmm1 = xmm1[0,0]
000000000004fc0b	movupd	0x20(%rbx), %xmm2
000000000004fc10	movupd	0x30(%rbx), %xmm3
000000000004fc15	movupd	0x40(%rbx), %xmm4
000000000004fc1a	movupd	0x50(%rbx), %xmm5
000000000004fc1f	movapd	%xmm1, %xmm6
000000000004fc23	mulpd	%xmm2, %xmm6
000000000004fc27	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
000000000004fc2b	movapd	%xmm0, %xmm7
000000000004fc2f	mulpd	%xmm4, %xmm7
000000000004fc33	addpd	%xmm6, %xmm7
000000000004fc37	movupd	%xmm7, 0x20(%rbx)
000000000004fc3c	movapd	%xmm1, %xmm6
000000000004fc40	mulpd	%xmm3, %xmm6
000000000004fc44	movapd	%xmm0, %xmm7
000000000004fc48	mulpd	%xmm5, %xmm7
000000000004fc4c	addpd	%xmm6, %xmm7
000000000004fc50	movupd	%xmm7, 0x30(%rbx)
000000000004fc55	mulpd	%xmm1, %xmm4
000000000004fc59	mulpd	%xmm0, %xmm2
000000000004fc5d	subpd	%xmm2, %xmm4
000000000004fc61	movupd	%xmm4, 0x40(%rbx)
000000000004fc66	mulpd	%xmm5, %xmm1
000000000004fc6a	mulpd	%xmm3, %xmm0
000000000004fc6e	subpd	%xmm0, %xmm1
000000000004fc72	movupd	%xmm1, 0x50(%rbx)
000000000004fc77	popq	%rbx
000000000004fc78	popq	%r14
000000000004fc7a	popq	%rbp
000000000004fc7b	retq
