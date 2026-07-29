__ZN8HGRetime9GetOutputEP10HGRenderer:
0000000000194020	pushq	%rbp
0000000000194021	movq	%rsp, %rbp
0000000000194024	pushq	%r15
0000000000194026	pushq	%r14
0000000000194028	pushq	%r13
000000000019402a	pushq	%r12
000000000019402c	pushq	%rbx
000000000019402d	subq	$0x28, %rsp
0000000000194031	movq	%rsi, %r15
0000000000194034	movq	%rdi, %r14
0000000000194037	xorl	%r12d, %r12d
000000000019403a	cmpl	$0x0, 0x1a8(%rdi)
0000000000194041	sete	%r12b
0000000000194045	movsd	0x198(%rdi), %xmm0
000000000019404d	movsd	0x1ac(%rdi), %xmm1
0000000000194055	mulps	%xmm0, %xmm1
0000000000194058	movaps	%xmm1, -0x50(%rbp)
000000000019405c	movl	0x1a4(%rdi), %r13d
0000000000194063	movl	$0x1b0, %edi                    ## imm = 0x1B0
0000000000194068	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
000000000019406d	movq	%rax, %rbx
0000000000194070	movl	$0x1b0, %esi                    ## imm = 0x1B0
0000000000194075	movq	%rax, %rdi
0000000000194078	callq	0x3c4fca                        ## symbol stub for: ___bzero
000000000019407d	leaq	0x23ac94(%rip), %rax
0000000000194084	movss	(%rax,%r12,4), %xmm0
000000000019408a	movss	%xmm0, -0x40(%rbp)
000000000019408f	testl	%r13d, %r13d
0000000000194092	je	0x19413d
0000000000194098	movq	%rbx, %rdi
000000000019409b	callq	__ZN16HgcRetimeFullRezC2Ev      ## HgcRetimeFullRez::HgcRetimeFullRez()
00000000001940a0	leaq	0x88fd91(%rip), %rax
00000000001940a7	movq	%rax, (%rbx)
00000000001940aa	movss	0x1a0(%r14), %xmm0
00000000001940b3	movss	0x236055(%rip), %xmm1
00000000001940bb	addss	%xmm0, %xmm1
00000000001940bf	xorps	%xmm3, %xmm3
00000000001940c2	movq	%rbx, %rdi
00000000001940c5	xorl	%esi, %esi
00000000001940c7	movss	-0x40(%rbp), %xmm2
00000000001940cc	callq	__ZN16HgcRetimeFullRez12SetParameterEiffff ## HgcRetimeFullRez::SetParameter(int, float, float, float, float)
00000000001940d1	movaps	0x235ff8(%rip), %xmm4
00000000001940d8	movaps	-0x50(%rbp), %xmm1
00000000001940dc	movshdup	%xmm1, %xmm3                    ## xmm3 = xmm1[1,1,3,3]
00000000001940e0	movaps	%xmm1, %xmm0
00000000001940e3	movaps	%xmm1, %xmm2
00000000001940e6	xorps	%xmm4, %xmm0
00000000001940e9	movaps	%xmm3, %xmm1
00000000001940ec	xorps	%xmm4, %xmm1
00000000001940ef	movq	(%rbx), %rax
00000000001940f2	movq	%rbx, %rdi
00000000001940f5	movl	$0x1, %esi
00000000001940fa	movaps	%xmm3, -0x40(%rbp)
00000000001940fe	callq	*0x60(%rax)
0000000000194101	movss	0x1ac(%r14), %xmm0
000000000019410a	movss	0x1b0(%r14), %xmm1
0000000000194113	movq	(%rbx), %rax
0000000000194116	xorps	%xmm2, %xmm2
0000000000194119	xorps	%xmm3, %xmm3
000000000019411c	movq	%rbx, %rdi
000000000019411f	movl	$0x2, %esi
0000000000194124	callq	*0x60(%rax)
0000000000194127	movaps	-0x50(%rbp), %xmm0
000000000019412b	movss	%xmm0, 0x1a0(%rbx)
0000000000194133	movl	$0x1a4, %eax                    ## imm = 0x1A4
0000000000194138	jmp	0x1941eb
000000000019413d	movq	%rbx, %rdi
0000000000194140	callq	__ZN20HgcRetimeVariableRezC2Ev  ## HgcRetimeVariableRez::HgcRetimeVariableRez()
0000000000194145	leaq	0x88ff44(%rip), %rax
000000000019414c	movq	%rax, (%rbx)
000000000019414f	movss	0x1a0(%r14), %xmm0
0000000000194158	movss	0x235fb0(%rip), %xmm1
0000000000194160	addss	%xmm0, %xmm1
0000000000194164	xorps	%xmm3, %xmm3
0000000000194167	movq	%rbx, %rdi
000000000019416a	xorl	%esi, %esi
000000000019416c	movss	-0x40(%rbp), %xmm2
0000000000194171	callq	__ZN20HgcRetimeVariableRez12SetParameterEiffff ## HgcRetimeVariableRez::SetParameter(int, float, float, float, float)
0000000000194176	movaps	0x235f53(%rip), %xmm4
000000000019417d	movaps	-0x50(%rbp), %xmm1
0000000000194181	movaps	%xmm1, %xmm0
0000000000194184	xorps	%xmm4, %xmm0
0000000000194187	movshdup	%xmm1, %xmm3                    ## xmm3 = xmm1[1,1,3,3]
000000000019418b	movaps	%xmm1, %xmm2
000000000019418e	movaps	%xmm3, %xmm1
0000000000194191	xorps	%xmm4, %xmm1
0000000000194194	movq	(%rbx), %rax
0000000000194197	movq	%rbx, %rdi
000000000019419a	movl	$0x1, %esi
000000000019419f	callq	*0x60(%rax)
00000000001941a2	movss	0x1ac(%r14), %xmm2
00000000001941ab	movss	0x1b0(%r14), %xmm3
00000000001941b4	movq	(%rbx), %rax
00000000001941b7	movss	0x233b09(%rip), %xmm0
00000000001941bf	movq	%rbx, %rdi
00000000001941c2	movl	$0x2, %esi
00000000001941c7	movaps	%xmm0, -0x40(%rbp)
00000000001941cb	movaps	%xmm0, %xmm1
00000000001941ce	callq	*0x60(%rax)
00000000001941d1	movaps	-0x50(%rbp), %xmm0
00000000001941d5	movlps	%xmm0, 0x1a0(%rbx)
00000000001941dc	movl	$0x3f000000, 0x1a8(%rbx)        ## imm = 0x3F000000
00000000001941e6	movl	$0x1ac, %eax                    ## imm = 0x1AC
00000000001941eb	movaps	-0x40(%rbp), %xmm0
00000000001941ef	movss	%xmm0, (%rbx,%rax)
00000000001941f4	movq	%r15, %rdi
00000000001941f7	movq	%r14, %rsi
00000000001941fa	xorl	%edx, %edx
00000000001941fc	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000194201	movq	(%rbx), %rcx
0000000000194204	movq	%rbx, %rdi
0000000000194207	xorl	%esi, %esi
0000000000194209	movq	%rax, %rdx
000000000019420c	callq	*0x78(%rcx)
000000000019420f	movq	%r15, %rdi
0000000000194212	movq	%r14, %rsi
0000000000194215	movl	$0x1, %edx
000000000019421a	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000019421f	movq	(%rbx), %rcx
0000000000194222	movq	%rbx, %rdi
0000000000194225	movl	$0x1, %esi
000000000019422a	movq	%rax, %rdx
000000000019422d	callq	*0x78(%rcx)
0000000000194230	movq	%r15, %rdi
0000000000194233	movq	%r14, %rsi
0000000000194236	movl	$0x2, %edx
000000000019423b	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000194240	movq	(%rbx), %rcx
0000000000194243	movq	%rbx, %rdi
0000000000194246	movl	$0x2, %esi
000000000019424b	movq	%rax, %rdx
000000000019424e	callq	*0x78(%rcx)
0000000000194251	movq	%rbx, 0x1b8(%r14)
0000000000194258	movq	%rbx, %rax
000000000019425b	addq	$0x28, %rsp
000000000019425f	popq	%rbx
0000000000194260	popq	%r12
0000000000194262	popq	%r13
0000000000194264	popq	%r14
0000000000194266	popq	%r15
0000000000194268	popq	%rbp
0000000000194269	retq
000000000019426a	jmp	0x19426c
000000000019426c	movq	%rax, %r14
000000000019426f	movq	%rbx, %rdi
0000000000194272	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000194277	movq	%r14, %rdi
000000000019427a	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000019427f	nop
