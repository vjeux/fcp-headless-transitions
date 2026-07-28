__ZN15OZQuadraticPath18intersectsWithLineERK9PCVector2IfES3_:
00000000004ef800	pushq	%rbp
00000000004ef801	movq	%rsp, %rbp
00000000004ef804	pushq	%r15
00000000004ef806	pushq	%r14
00000000004ef808	pushq	%r13
00000000004ef80a	pushq	%r12
00000000004ef80c	pushq	%rbx
00000000004ef80d	subq	$0x28, %rsp
00000000004ef811	movq	0x336c20(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000004ef818	movq	(%rax), %rax
00000000004ef81b	movq	%rax, -0x30(%rbp)
00000000004ef81f	movq	0x8(%rdi), %r13
00000000004ef823	cmpq	%rdi, %r13
00000000004ef826	je	0x4efad1
00000000004ef82c	movq	%rdx, %r9
00000000004ef82f	movq	%rdi, %r15
00000000004ef832	xorl	%r12d, %r12d
00000000004ef835	movl	$0x1, %ecx
00000000004ef83a	xorps	%xmm6, %xmm6
00000000004ef83d	movaps	0x21837c(%rip), %xmm7
00000000004ef844	movss	0x218393(%rip), %xmm8
00000000004ef84d	movss	0x217d06(%rip), %xmm9
00000000004ef856	xorl	%ebx, %ebx
00000000004ef858	movq	%rsi, -0x48(%rbp)
00000000004ef85c	jmp	0x4ef87c
00000000004ef85e	nop
00000000004ef860	movq	%r14, %r9
00000000004ef863	movq	-0x48(%rbp), %rsi
00000000004ef867	movl	$0x1, %ecx
00000000004ef86c	xorps	%xmm6, %xmm6
00000000004ef86f	movq	0x8(%r13), %r13
00000000004ef873	cmpq	%r15, %r13
00000000004ef876	je	0x4efad1
00000000004ef87c	movq	0x10(%r13), %r8
00000000004ef880	movq	0x8(%r15), %rax
00000000004ef884	cmpq	0x10(%rax), %r8
00000000004ef888	movzbl	%bl, %ebx
00000000004ef88b	cmovel	%ecx, %ebx
00000000004ef88e	movq	(%r15), %rax
00000000004ef891	cmpq	0x10(%rax), %r8
00000000004ef895	movzbl	%r12b, %r12d
00000000004ef899	cmovel	%ecx, %r12d
00000000004ef89d	cmpl	$0x0, (%r8)
00000000004ef8a1	je	0x4ef9b0
00000000004ef8a7	leaq	0x4(%r8), %rdx
00000000004ef8ab	leaq	0x14(%r8), %rcx
00000000004ef8af	addq	$0xc, %r8
00000000004ef8b3	leaq	-0x40(%rbp), %rax
00000000004ef8b7	movq	%rax, (%rsp)
00000000004ef8bb	movq	%rsi, %rdi
00000000004ef8be	movq	%r9, %r14
00000000004ef8c1	movq	%r9, %rsi
00000000004ef8c4	leaq	-0x38(%rbp), %r9
00000000004ef8c8	callq	__Z22PCLineQuadIntersectionIfEiRK9PCVector2IT_ES4_S4_S4_S4_PA2_S1_S6_ ## int PCLineQuadIntersection<float>(PCVector2<float> const&, PCVector2<float> const&, PCVector2<float> const&, PCVector2<float> const&, PCVector2<float> const&, float (*) [2], float (*) [2])
00000000004ef8cd	movss	0x217c86(%rip), %xmm9
00000000004ef8d6	movss	0x218301(%rip), %xmm8
00000000004ef8df	movaps	0x2182da(%rip), %xmm7
00000000004ef8e6	testl	%eax, %eax
00000000004ef8e8	jle	0x4ef860
00000000004ef8ee	testb	$0x1, %r12b
00000000004ef8f2	je	0x4efa6b
00000000004ef8f8	movl	%eax, %eax
00000000004ef8fa	xorl	%ecx, %ecx
00000000004ef8fc	testb	$0x1, %bl
00000000004ef8ff	jne	0x4ef95c
00000000004ef901	nopw	%cs:(%rax,%rax)
00000000004ef910	movss	-0x38(%rbp,%rcx,4), %xmm0
00000000004ef916	addss	%xmm9, %xmm0
00000000004ef91b	andps	%xmm7, %xmm0
00000000004ef91e	ucomiss	%xmm0, %xmm8
00000000004ef922	jbe	0x4efab0
00000000004ef928	movss	-0x40(%rbp,%rcx,4), %xmm0
00000000004ef92e	andps	%xmm7, %xmm0
00000000004ef931	ucomiss	%xmm0, %xmm8
00000000004ef935	jbe	0x4efab0
00000000004ef93b	incq	%rcx
00000000004ef93e	cmpq	%rcx, %rax
00000000004ef941	jne	0x4ef910
00000000004ef943	jmp	0x4ef860
00000000004ef948	nopl	(%rax,%rax)
00000000004ef950	incq	%rcx
00000000004ef953	cmpq	%rcx, %rax
00000000004ef956	je	0x4ef860
00000000004ef95c	movss	-0x38(%rbp,%rcx,4), %xmm0
00000000004ef962	movaps	%xmm0, %xmm1
00000000004ef965	addss	%xmm9, %xmm1
00000000004ef96a	andps	%xmm7, %xmm1
00000000004ef96d	ucomiss	%xmm1, %xmm8
00000000004ef971	jbe	0x4ef982
00000000004ef973	movss	-0x40(%rbp,%rcx,4), %xmm1
00000000004ef979	andps	%xmm7, %xmm1
00000000004ef97c	ucomiss	%xmm1, %xmm8
00000000004ef980	ja	0x4ef950
00000000004ef982	andps	%xmm7, %xmm0
00000000004ef985	ucomiss	%xmm0, %xmm8
00000000004ef989	jbe	0x4efab0
00000000004ef98f	movss	-0x40(%rbp,%rcx,4), %xmm0
00000000004ef995	addss	%xmm9, %xmm0
00000000004ef99a	andps	%xmm7, %xmm0
00000000004ef99d	ucomiss	%xmm0, %xmm8
00000000004ef9a1	ja	0x4ef950
00000000004ef9a3	jmp	0x4efab0
00000000004ef9a8	nopl	(%rax,%rax)
00000000004ef9b0	movsd	(%rsi), %xmm1
00000000004ef9b4	movsd	0x4(%r8), %xmm4
00000000004ef9ba	movsd	0xc(%r8), %xmm0
00000000004ef9c0	subps	%xmm4, %xmm0
00000000004ef9c3	shufps	$0xe1, %xmm0, %xmm0             ## xmm0 = xmm0[1,0,2,3]
00000000004ef9c7	movsd	(%r9), %xmm2
00000000004ef9cc	subps	%xmm1, %xmm2
00000000004ef9cf	movaps	%xmm2, %xmm5
00000000004ef9d2	mulps	%xmm0, %xmm5
00000000004ef9d5	movshdup	%xmm5, %xmm3                    ## xmm3 = xmm5[1,1,3,3]
00000000004ef9d9	subss	%xmm5, %xmm3
00000000004ef9dd	ucomiss	%xmm6, %xmm3
00000000004ef9e0	jne	0x4ef9e8
00000000004ef9e2	jnp	0x4ef86f
00000000004ef9e8	subps	%xmm4, %xmm1
00000000004ef9eb	mulps	%xmm1, %xmm0
00000000004ef9ee	movshdup	%xmm0, %xmm4                    ## xmm4 = xmm0[1,1,3,3]
00000000004ef9f2	subss	%xmm4, %xmm0
00000000004ef9f6	divss	%xmm3, %xmm0
00000000004ef9fa	ucomiss	%xmm6, %xmm0
00000000004ef9fd	jb	0x4ef86f
00000000004efa03	movss	0x217545(%rip), %xmm4
00000000004efa0b	ucomiss	%xmm0, %xmm4
00000000004efa0e	jb	0x4ef86f
00000000004efa14	movshdup	%xmm2, %xmm4                    ## xmm4 = xmm2[1,1,3,3]
00000000004efa18	mulss	%xmm1, %xmm4
00000000004efa1c	movshdup	%xmm1, %xmm1                    ## xmm1 = xmm1[1,1,3,3]
00000000004efa20	mulss	%xmm2, %xmm1
00000000004efa24	subss	%xmm1, %xmm4
00000000004efa28	divss	%xmm3, %xmm4
00000000004efa2c	ucomiss	%xmm6, %xmm4
00000000004efa2f	jb	0x4ef86f
00000000004efa35	movss	0x217513(%rip), %xmm1
00000000004efa3d	ucomiss	%xmm4, %xmm1
00000000004efa40	jb	0x4ef86f
00000000004efa46	andps	%xmm7, %xmm0
00000000004efa49	ucomiss	%xmm0, %xmm8
00000000004efa4d	movb	$0x1, %al
00000000004efa4f	jbe	0x4efab2
00000000004efa51	testb	$0x1, %r12b
00000000004efa55	je	0x4efab2
00000000004efa57	addss	%xmm9, %xmm4
00000000004efa5c	andps	%xmm7, %xmm4
00000000004efa5f	ucomiss	%xmm4, %xmm8
00000000004efa63	ja	0x4ef86f
00000000004efa69	jmp	0x4efab2
00000000004efa6b	testb	$0x1, %bl
00000000004efa6e	je	0x4efab0
00000000004efa70	movl	%eax, %eax
00000000004efa72	xorl	%ecx, %ecx
00000000004efa74	nopw	%cs:(%rax,%rax)
00000000004efa80	movss	-0x38(%rbp,%rcx,4), %xmm0
00000000004efa86	andps	%xmm7, %xmm0
00000000004efa89	ucomiss	%xmm0, %xmm8
00000000004efa8d	jbe	0x4efab0
00000000004efa8f	movss	-0x40(%rbp,%rcx,4), %xmm0
00000000004efa95	addss	%xmm9, %xmm0
00000000004efa9a	andps	%xmm7, %xmm0
00000000004efa9d	ucomiss	%xmm0, %xmm8
00000000004efaa1	jbe	0x4efab0
00000000004efaa3	incq	%rcx
00000000004efaa6	cmpq	%rcx, %rax
00000000004efaa9	jne	0x4efa80
00000000004efaab	jmp	0x4ef860
00000000004efab0	movb	$0x1, %al
00000000004efab2	movq	0x33697f(%rip), %rcx            ## literal pool symbol address: ___stack_chk_guard
00000000004efab9	movq	(%rcx), %rcx
00000000004efabc	cmpq	-0x30(%rbp), %rcx
00000000004efac0	jne	0x4efae3
00000000004efac2	addq	$0x28, %rsp
00000000004efac6	popq	%rbx
00000000004efac7	popq	%r12
00000000004efac9	popq	%r13
00000000004efacb	popq	%r14
00000000004efacd	popq	%r15
00000000004efacf	popq	%rbp
00000000004efad0	retq
00000000004efad1	xorl	%eax, %eax
00000000004efad3	movq	0x33695e(%rip), %rcx            ## literal pool symbol address: ___stack_chk_guard
00000000004efada	movq	(%rcx), %rcx
00000000004efadd	cmpq	-0x30(%rbp), %rcx
00000000004efae1	je	0x4efac2
00000000004efae3	callq	0x6dfd38                        ## symbol stub for: ___stack_chk_fail
00000000004efae8	nopl	(%rax,%rax)
