__ZN14PCMatrix44TmplIdE11rightRotateEdNS0_4axisE:
000000000004fc90	xorpd	%xmm1, %xmm1
000000000004fc94	ucomisd	%xmm1, %xmm0
000000000004fc98	jne	0x4fc9d
000000000004fc9a	jp	0x4fc9d
000000000004fc9c	retq
000000000004fc9d	pushq	%rbp
000000000004fc9e	movq	%rsp, %rbp
000000000004fca1	pushq	%r14
000000000004fca3	pushq	%rbx
000000000004fca4	movl	%esi, %r14d
000000000004fca7	movapd	%xmm0, %xmm2
000000000004fcab	movq	%rdi, %rbx
000000000004fcae	movsd	0xd5a72(%rip), %xmm0
000000000004fcb6	subsd	%xmm2, %xmm0
000000000004fcba	andpd	0xd29ae(%rip), %xmm0
000000000004fcc2	xorpd	%xmm3, %xmm3
000000000004fcc6	movsd	0xd2bb2(%rip), %xmm4
000000000004fcce	ucomisd	%xmm0, %xmm4
000000000004fcd2	ja	0x4fcf2
000000000004fcd4	movsd	0xd38a4(%rip), %xmm0
000000000004fcdc	subsd	%xmm2, %xmm0
000000000004fce0	andpd	0xd2988(%rip), %xmm0
000000000004fce8	ucomisd	%xmm0, %xmm4
000000000004fcec	jbe	0x4fe7e
000000000004fcf2	movsd	0xd2836(%rip), %xmm0
000000000004fcfa	unpcklpd	%xmm0, %xmm3                    ## xmm3 = xmm3[0],xmm0[0]
000000000004fcfe	testl	%r14d, %r14d
000000000004fd01	je	0x4fec3
000000000004fd07	cmpl	$0x1, %r14d
000000000004fd0b	je	0x4fd93
000000000004fd11	cmpl	$0x2, %r14d
000000000004fd15	jne	0x4ff38
000000000004fd1b	movddup	(%rbx), %xmm0                   ## xmm0 = mem[0,0]
000000000004fd1f	mulpd	%xmm3, %xmm0
000000000004fd23	movapd	%xmm3, %xmm1
000000000004fd27	shufpd	$0x1, %xmm3, %xmm1              ## xmm1 = xmm1[1],xmm3[0]
000000000004fd2c	movddup	0x8(%rbx), %xmm2                ## xmm2 = mem[0,0]
000000000004fd31	mulpd	%xmm1, %xmm2
000000000004fd35	addsubpd	%xmm2, %xmm0
000000000004fd39	movupd	%xmm0, (%rbx)
000000000004fd3d	movddup	0x20(%rbx), %xmm0               ## xmm0 = mem[0,0]
000000000004fd42	mulpd	%xmm3, %xmm0
000000000004fd46	movddup	0x28(%rbx), %xmm2               ## xmm2 = mem[0,0]
000000000004fd4b	mulpd	%xmm1, %xmm2
000000000004fd4f	addsubpd	%xmm2, %xmm0
000000000004fd53	movupd	%xmm0, 0x20(%rbx)
000000000004fd58	movddup	0x40(%rbx), %xmm0               ## xmm0 = mem[0,0]
000000000004fd5d	mulpd	%xmm3, %xmm0
000000000004fd61	movddup	0x48(%rbx), %xmm2               ## xmm2 = mem[0,0]
000000000004fd66	mulpd	%xmm1, %xmm2
000000000004fd6a	addsubpd	%xmm2, %xmm0
000000000004fd6e	movupd	%xmm0, 0x40(%rbx)
000000000004fd73	movddup	0x60(%rbx), %xmm0               ## xmm0 = mem[0,0]
000000000004fd78	mulpd	%xmm3, %xmm0
000000000004fd7c	movddup	0x68(%rbx), %xmm2               ## xmm2 = mem[0,0]
000000000004fd81	mulpd	%xmm1, %xmm2
000000000004fd85	addsubpd	%xmm2, %xmm0
000000000004fd89	movupd	%xmm0, 0x60(%rbx)
000000000004fd8e	jmp	0x4ff38
000000000004fd93	movsd	(%rbx), %xmm8
000000000004fd98	movsd	0x10(%rbx), %xmm2
000000000004fd9d	movapd	%xmm1, %xmm4
000000000004fda1	mulsd	%xmm8, %xmm4
000000000004fda6	movapd	%xmm0, %xmm3
000000000004fdaa	mulsd	%xmm2, %xmm3
000000000004fdae	addsd	%xmm4, %xmm3
000000000004fdb2	movsd	0x20(%rbx), %xmm9
000000000004fdb8	movapd	%xmm1, %xmm6
000000000004fdbc	mulsd	%xmm9, %xmm6
000000000004fdc1	movsd	0x30(%rbx), %xmm4
000000000004fdc6	movapd	%xmm0, %xmm5
000000000004fdca	mulsd	%xmm4, %xmm5
000000000004fdce	addsd	%xmm6, %xmm5
000000000004fdd2	movsd	0x40(%rbx), %xmm10
000000000004fdd8	movapd	%xmm1, %xmm11
000000000004fddd	mulsd	%xmm10, %xmm11
000000000004fde2	movsd	0x50(%rbx), %xmm6
000000000004fde7	movapd	%xmm0, %xmm7
000000000004fdeb	mulsd	%xmm6, %xmm7
000000000004fdef	addsd	%xmm11, %xmm7
000000000004fdf4	movsd	0x60(%rbx), %xmm11
000000000004fdfa	movapd	%xmm1, %xmm12
000000000004fdff	mulsd	%xmm11, %xmm12
000000000004fe04	movsd	0x70(%rbx), %xmm13
000000000004fe0a	movapd	%xmm0, %xmm14
000000000004fe0f	mulsd	%xmm13, %xmm14
000000000004fe14	addsd	%xmm12, %xmm14
000000000004fe19	mulsd	%xmm1, %xmm2
000000000004fe1d	mulsd	%xmm0, %xmm8
000000000004fe22	subsd	%xmm8, %xmm2
000000000004fe27	mulsd	%xmm1, %xmm4
000000000004fe2b	mulsd	%xmm0, %xmm9
000000000004fe30	subsd	%xmm9, %xmm4
000000000004fe35	mulsd	%xmm1, %xmm6
000000000004fe39	mulsd	%xmm0, %xmm10
000000000004fe3e	subsd	%xmm10, %xmm6
000000000004fe43	mulsd	%xmm13, %xmm1
000000000004fe48	mulsd	%xmm11, %xmm0
000000000004fe4d	subsd	%xmm0, %xmm1
000000000004fe51	movsd	%xmm3, (%rbx)
000000000004fe55	movsd	%xmm5, 0x20(%rbx)
000000000004fe5a	movsd	%xmm7, 0x40(%rbx)
000000000004fe5f	movsd	%xmm14, 0x60(%rbx)
000000000004fe65	movsd	%xmm2, 0x10(%rbx)
000000000004fe6a	movsd	%xmm4, 0x30(%rbx)
000000000004fe6f	movsd	%xmm6, 0x50(%rbx)
000000000004fe74	movsd	%xmm1, 0x70(%rbx)
000000000004fe79	jmp	0x4ff38
000000000004fe7e	movsd	0xd26ea(%rip), %xmm0
000000000004fe86	subsd	%xmm2, %xmm0
000000000004fe8a	andpd	0xd27de(%rip), %xmm0
000000000004fe92	ucomisd	%xmm0, %xmm4
000000000004fe96	ja	0x4feb6
000000000004fe98	movsd	0xd5890(%rip), %xmm0
000000000004fea0	subsd	%xmm2, %xmm0
000000000004fea4	andpd	0xd27c4(%rip), %xmm0
000000000004feac	ucomisd	%xmm0, %xmm4
000000000004feb0	jbe	0x4ff3d
000000000004feb6	movsd	0xd2bb2(%rip), %xmm0
000000000004febe	jmp	0x4fcfa
000000000004fec3	movddup	0x8(%rbx), %xmm0                ## xmm0 = mem[0,0]
000000000004fec8	mulpd	%xmm3, %xmm0
000000000004fecc	movapd	%xmm3, %xmm1
000000000004fed0	shufpd	$0x1, %xmm3, %xmm1              ## xmm1 = xmm1[1],xmm3[0]
000000000004fed5	movddup	0x10(%rbx), %xmm2               ## xmm2 = mem[0,0]
000000000004feda	mulpd	%xmm1, %xmm2
000000000004fede	addsubpd	%xmm2, %xmm0
000000000004fee2	movupd	%xmm0, 0x8(%rbx)
000000000004fee7	movddup	0x28(%rbx), %xmm0               ## xmm0 = mem[0,0]
000000000004feec	mulpd	%xmm3, %xmm0
000000000004fef0	movddup	0x30(%rbx), %xmm2               ## xmm2 = mem[0,0]
000000000004fef5	mulpd	%xmm1, %xmm2
000000000004fef9	addsubpd	%xmm2, %xmm0
000000000004fefd	movupd	%xmm0, 0x28(%rbx)
000000000004ff02	movddup	0x48(%rbx), %xmm0               ## xmm0 = mem[0,0]
000000000004ff07	mulpd	%xmm3, %xmm0
000000000004ff0b	movddup	0x50(%rbx), %xmm2               ## xmm2 = mem[0,0]
000000000004ff10	mulpd	%xmm1, %xmm2
000000000004ff14	addsubpd	%xmm2, %xmm0
000000000004ff18	movupd	%xmm0, 0x48(%rbx)
000000000004ff1d	movddup	0x68(%rbx), %xmm0               ## xmm0 = mem[0,0]
000000000004ff22	mulpd	%xmm3, %xmm0
000000000004ff26	movddup	0x70(%rbx), %xmm2               ## xmm2 = mem[0,0]
000000000004ff2b	mulpd	%xmm1, %xmm2
000000000004ff2f	addsubpd	%xmm2, %xmm0
000000000004ff33	movupd	%xmm0, 0x68(%rbx)
000000000004ff38	popq	%rbx
000000000004ff39	popq	%r14
000000000004ff3b	popq	%rbp
000000000004ff3c	retq
000000000004ff3d	movsd	0xd57cb(%rip), %xmm5
000000000004ff45	subsd	%xmm2, %xmm5
000000000004ff49	andpd	0xd271f(%rip), %xmm5
000000000004ff51	movsd	0xd2b17(%rip), %xmm3
000000000004ff59	xorpd	%xmm0, %xmm0
000000000004ff5d	movsd	0xd2b0b(%rip), %xmm1
000000000004ff65	ucomisd	%xmm5, %xmm4
000000000004ff69	ja	0x4fcfe
000000000004ff6f	movsd	0xd2629(%rip), %xmm5
000000000004ff77	subsd	%xmm2, %xmm5
000000000004ff7b	andpd	0xd26ed(%rip), %xmm5
000000000004ff83	ucomisd	%xmm5, %xmm4
000000000004ff87	ja	0x4fcfe
000000000004ff8d	movapd	%xmm2, %xmm0
000000000004ff91	callq	0xde738                         ## symbol stub for: ___sincos_stret
000000000004ff96	xorpd	0x920d2(%rip), %xmm0
000000000004ff9e	movapd	%xmm1, %xmm3
000000000004ffa2	jmp	0x4fcfa
