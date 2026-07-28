__ZN15OZQuadraticPath23intersectsWithQuadraticERK9PCVector2IfES3_S3_:
00000000004efee0	pushq	%rbp
00000000004efee1	movq	%rsp, %rbp
00000000004efee4	pushq	%r15
00000000004efee6	pushq	%r14
00000000004efee8	pushq	%r13
00000000004efeea	pushq	%r12
00000000004efeec	pushq	%rbx
00000000004efeed	subq	$0xb8, %rsp
00000000004efef4	movq	%rcx, -0x90(%rbp)
00000000004efefb	movq	%rdx, -0x88(%rbp)
00000000004eff02	movq	0x33652f(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
00000000004eff09	movq	(%rax), %rax
00000000004eff0c	movq	%rax, -0x30(%rbp)
00000000004eff10	movq	0x8(%rdi), %r13
00000000004eff14	cmpq	%rdi, %r13
00000000004eff17	je	0x4f0161
00000000004eff1d	movq	%rsi, %r15
00000000004eff20	movq	%rdi, %r12
00000000004eff23	xorl	%ebx, %ebx
00000000004eff25	xorl	%r14d, %r14d
00000000004eff28	movl	%r14d, %eax
00000000004eff2b	movl	%ebx, %ecx
00000000004eff2d	movq	0x10(%r13), %rsi
00000000004eff31	movq	(%r12), %rdx
00000000004eff35	movq	0x8(%r12), %rdi
00000000004eff3a	cmpq	0x10(%rdi), %rsi
00000000004eff3e	sete	%r14b
00000000004eff42	orb	%al, %r14b
00000000004eff45	cmpq	0x10(%rdx), %rsi
00000000004eff49	sete	%bl
00000000004eff4c	orb	%cl, %bl
00000000004eff4e	cmpl	$0x0, (%rsi)
00000000004eff51	je	0x4f0010
00000000004eff57	xorps	%xmm0, %xmm0
00000000004eff5a	movaps	%xmm0, -0x40(%rbp)
00000000004eff5e	movaps	%xmm0, -0x50(%rbp)
00000000004eff62	movaps	%xmm0, -0x60(%rbp)
00000000004eff66	movaps	%xmm0, -0x70(%rbp)
00000000004eff6a	cvtps2pd	(%r15), %xmm0
00000000004eff6e	movaps	%xmm0, -0x80(%rbp)
00000000004eff72	movq	-0x88(%rbp), %rax
00000000004eff79	cvtps2pd	(%rax), %xmm0
00000000004eff7c	movaps	%xmm0, -0xe0(%rbp)
00000000004eff83	movq	-0x90(%rbp), %rax
00000000004eff8a	cvtps2pd	(%rax), %xmm0
00000000004eff8d	movaps	%xmm0, -0xd0(%rbp)
00000000004eff94	cvtps2pd	0x4(%rsi), %xmm0
00000000004eff98	movaps	%xmm0, -0xc0(%rbp)
00000000004eff9f	cvtps2pd	0x14(%rsi), %xmm0
00000000004effa3	movaps	%xmm0, -0xb0(%rbp)
00000000004effaa	cvtps2pd	0xc(%rsi), %xmm0
00000000004effae	movaps	%xmm0, -0xa0(%rbp)
00000000004effb5	leaq	-0x80(%rbp), %rdi
00000000004effb9	leaq	-0xe0(%rbp), %rsi
00000000004effc0	leaq	-0xd0(%rbp), %rdx
00000000004effc7	leaq	-0xc0(%rbp), %rcx
00000000004effce	leaq	-0xb0(%rbp), %r8
00000000004effd5	leaq	-0xa0(%rbp), %r9
00000000004effdc	pushq	$0x1
00000000004effde	leaq	-0x70(%rbp), %rax
00000000004effe2	pushq	%rax
00000000004effe3	callq	0x6dd1ee                        ## symbol stub for: __Z22PCQuadQuadIntersectionRK9PCVector2IdES2_S2_S2_S2_S2_PA4_S0_b
00000000004effe8	addq	$0x10, %rsp
00000000004effec	testl	%eax, %eax
00000000004effee	jg	0x4f013d
00000000004efff4	movq	0x8(%r13), %r13
00000000004efff8	cmpq	%r12, %r13
00000000004efffb	jne	0x4eff28
00000000004f0001	jmp	0x4f0161
00000000004f0006	nopw	%cs:(%rax,%rax)
00000000004f0010	leaq	0x4(%rsi), %rdi
00000000004f0014	addq	$0xc, %rsi
00000000004f0018	subq	$0x8, %rsp
00000000004f001c	movq	%r15, %rdx
00000000004f001f	movq	-0x88(%rbp), %rcx
00000000004f0026	movq	-0x90(%rbp), %r8
00000000004f002d	leaq	-0x70(%rbp), %r9
00000000004f0031	leaq	-0x80(%rbp), %rax
00000000004f0035	pushq	%rax
00000000004f0036	callq	__Z22PCLineQuadIntersectionIfEiRK9PCVector2IT_ES4_S4_S4_S4_PA2_S1_S6_ ## int PCLineQuadIntersection<float>(PCVector2<float> const&, PCVector2<float> const&, PCVector2<float> const&, PCVector2<float> const&, PCVector2<float> const&, float (*) [2], float (*) [2])
00000000004f003b	addq	$0x10, %rsp
00000000004f003f	testl	%eax, %eax
00000000004f0041	movaps	0x217b78(%rip), %xmm2
00000000004f0048	movss	0x217b90(%rip), %xmm3
00000000004f0050	movss	0x217504(%rip), %xmm4
00000000004f0058	jle	0x4efff4
00000000004f005a	testb	$0x1, %bl
00000000004f005d	je	0x4f00fb
00000000004f0063	movl	%eax, %eax
00000000004f0065	xorl	%ecx, %ecx
00000000004f0067	testb	$0x1, %r14b
00000000004f006b	jne	0x4f00bc
00000000004f006d	nopl	(%rax)
00000000004f0070	movss	-0x70(%rbp,%rcx,4), %xmm0
00000000004f0076	andps	%xmm2, %xmm0
00000000004f0079	ucomiss	%xmm0, %xmm3
00000000004f007c	jbe	0x4f013d
00000000004f0082	movss	-0x80(%rbp,%rcx,4), %xmm0
00000000004f0088	addss	%xmm4, %xmm0
00000000004f008c	andps	%xmm2, %xmm0
00000000004f008f	ucomiss	%xmm0, %xmm3
00000000004f0092	jbe	0x4f013d
00000000004f0098	incq	%rcx
00000000004f009b	cmpq	%rcx, %rax
00000000004f009e	jne	0x4f0070
00000000004f00a0	jmp	0x4efff4
00000000004f00a5	nopw	%cs:(%rax,%rax)
00000000004f00b0	incq	%rcx
00000000004f00b3	cmpq	%rcx, %rax
00000000004f00b6	je	0x4efff4
00000000004f00bc	movss	-0x70(%rbp,%rcx,4), %xmm0
00000000004f00c2	movaps	%xmm0, %xmm1
00000000004f00c5	andps	%xmm2, %xmm1
00000000004f00c8	ucomiss	%xmm1, %xmm3
00000000004f00cb	jbe	0x4f00df
00000000004f00cd	movss	-0x80(%rbp,%rcx,4), %xmm1
00000000004f00d3	addss	%xmm4, %xmm1
00000000004f00d7	andps	%xmm2, %xmm1
00000000004f00da	ucomiss	%xmm1, %xmm3
00000000004f00dd	ja	0x4f00b0
00000000004f00df	addss	%xmm4, %xmm0
00000000004f00e3	andps	%xmm2, %xmm0
00000000004f00e6	ucomiss	%xmm0, %xmm3
00000000004f00e9	jbe	0x4f013d
00000000004f00eb	movss	-0x80(%rbp,%rcx,4), %xmm0
00000000004f00f1	andps	%xmm2, %xmm0
00000000004f00f4	ucomiss	%xmm0, %xmm3
00000000004f00f7	ja	0x4f00b0
00000000004f00f9	jmp	0x4f013d
00000000004f00fb	testb	$0x1, %r14b
00000000004f00ff	je	0x4f013d
00000000004f0101	movl	%eax, %eax
00000000004f0103	xorl	%ecx, %ecx
00000000004f0105	nopw	%cs:(%rax,%rax)
00000000004f0110	movss	-0x70(%rbp,%rcx,4), %xmm0
00000000004f0116	addss	%xmm4, %xmm0
00000000004f011a	andps	%xmm2, %xmm0
00000000004f011d	ucomiss	%xmm0, %xmm3
00000000004f0120	jbe	0x4f013d
00000000004f0122	movss	-0x80(%rbp,%rcx,4), %xmm0
00000000004f0128	andps	%xmm2, %xmm0
00000000004f012b	ucomiss	%xmm0, %xmm3
00000000004f012e	jbe	0x4f013d
00000000004f0130	incq	%rcx
00000000004f0133	cmpq	%rcx, %rax
00000000004f0136	jne	0x4f0110
00000000004f0138	jmp	0x4efff4
00000000004f013d	movb	$0x1, %al
00000000004f013f	movq	0x3362f2(%rip), %rcx            ## literal pool symbol address: ___stack_chk_guard
00000000004f0146	movq	(%rcx), %rcx
00000000004f0149	cmpq	-0x30(%rbp), %rcx
00000000004f014d	jne	0x4f0173
00000000004f014f	addq	$0xb8, %rsp
00000000004f0156	popq	%rbx
00000000004f0157	popq	%r12
00000000004f0159	popq	%r13
00000000004f015b	popq	%r14
00000000004f015d	popq	%r15
00000000004f015f	popq	%rbp
00000000004f0160	retq
00000000004f0161	xorl	%eax, %eax
00000000004f0163	movq	0x3362ce(%rip), %rcx            ## literal pool symbol address: ___stack_chk_guard
00000000004f016a	movq	(%rcx), %rcx
00000000004f016d	cmpq	-0x30(%rbp), %rcx
00000000004f0171	je	0x4f014f
00000000004f0173	callq	0x6dfd38                        ## symbol stub for: ___stack_chk_fail
00000000004f0178	nopl	(%rax,%rax)
