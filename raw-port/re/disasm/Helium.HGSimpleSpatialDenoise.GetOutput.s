__ZN22HGSimpleSpatialDenoise9GetOutputEP10HGRenderer:
00000000001c8470	pushq	%rbp
00000000001c8471	movq	%rsp, %rbp
00000000001c8474	pushq	%r15
00000000001c8476	pushq	%r14
00000000001c8478	pushq	%r13
00000000001c847a	pushq	%r12
00000000001c847c	pushq	%rbx
00000000001c847d	pushq	%rax
00000000001c847e	movq	%rsi, %r15
00000000001c8481	movq	%rdi, %rbx
00000000001c8484	movl	$0x1d0, %edi                    ## imm = 0x1D0
00000000001c8489	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001c848e	movq	%rax, %r14
00000000001c8491	movq	%rax, %rdi
00000000001c8494	callq	__ZN13HGTextureWrapC1Ev         ## HGTextureWrap::HGTextureWrap()
00000000001c8499	movq	%r15, %rdi
00000000001c849c	movq	%rbx, %rsi
00000000001c849f	xorl	%edx, %edx
00000000001c84a1	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000001c84a6	movq	(%r14), %rcx
00000000001c84a9	movq	%r14, %rdi
00000000001c84ac	xorl	%esi, %esi
00000000001c84ae	movq	%rax, %rdx
00000000001c84b1	callq	*0x78(%rcx)
00000000001c84b4	movq	%r14, %rdi
00000000001c84b7	movl	$0x1, %esi
00000000001c84bc	callq	__ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE ## HGTextureWrap::SetTextureWrapMode(HGTextureWrap::WrapMode)
00000000001c84c1	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000001c84c6	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001c84cb	movq	%rax, %r15
00000000001c84ce	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000001c84d3	movq	%rax, %rdi
00000000001c84d6	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000001c84db	movq	%r15, %rdi
00000000001c84de	callq	__ZN23HgcSimpleSpatialDenoiseC2Ev ## HgcSimpleSpatialDenoise::HgcSimpleSpatialDenoise()
00000000001c84e3	leaq	0x8610ae(%rip), %r12
00000000001c84ea	movq	%r12, (%r15)
00000000001c84ed	movq	%r15, %rdi
00000000001c84f0	xorl	%esi, %esi
00000000001c84f2	movq	%r14, %rdx
00000000001c84f5	callq	__ZN6HGNode8SetInputEiPS_       ## HGNode::SetInput(int, HGNode*)
00000000001c84fa	movq	(%r14), %rax
00000000001c84fd	movq	%r14, %rdi
00000000001c8500	callq	*0x18(%rax)
00000000001c8503	movl	0x198(%rbx), %ecx
00000000001c8509	movq	(%r15), %rax
00000000001c850c	movq	0x60(%rax), %rax
00000000001c8510	cmpl	$0x1, %ecx
00000000001c8513	je	0x1c853b
00000000001c8515	movss	0x201dd7(%rip), %xmm0
00000000001c851d	testl	%ecx, %ecx
00000000001c851f	jne	0x1c8548
00000000001c8521	movss	0x2024ab(%rip), %xmm1
00000000001c8529	movss	0x203193(%rip), %xmm2
00000000001c8531	xorps	%xmm3, %xmm3
00000000001c8534	movq	%r15, %rdi
00000000001c8537	xorl	%esi, %esi
00000000001c8539	jmp	0x1c855b
00000000001c853b	movss	0x202491(%rip), %xmm0
00000000001c8543	xorps	%xmm2, %xmm2
00000000001c8546	jmp	0x1c8550
00000000001c8548	movss	0x1ff778(%rip), %xmm2
00000000001c8550	xorps	%xmm3, %xmm3
00000000001c8553	movq	%r15, %rdi
00000000001c8556	xorl	%esi, %esi
00000000001c8558	movaps	%xmm0, %xmm1
00000000001c855b	callq	*%rax
00000000001c855d	movq	(%r15), %rax
00000000001c8560	cmpb	$0x0, 0x1a0(%rbx)
00000000001c8567	movss	0x1ff751(%rip), %xmm3
00000000001c856f	movaps	%xmm3, %xmm0
00000000001c8572	jne	0x1c8577
00000000001c8574	xorps	%xmm0, %xmm0
00000000001c8577	movl	$0x1, %r13d
00000000001c857d	xorps	%xmm1, %xmm1
00000000001c8580	xorps	%xmm2, %xmm2
00000000001c8583	movq	%r15, %rdi
00000000001c8586	movl	$0x1, %esi
00000000001c858b	callq	*0x60(%rax)
00000000001c858e	cmpl	$0x2, 0x19c(%rbx)
00000000001c8595	jae	0x1c85e8
00000000001c8597	movq	%r15, %r14
00000000001c859a	movq	%r14, 0x1a8(%rbx)
00000000001c85a1	movq	%r14, %rax
00000000001c85a4	addq	$0x8, %rsp
00000000001c85a8	popq	%rbx
00000000001c85a9	popq	%r12
00000000001c85ab	popq	%r13
00000000001c85ad	popq	%r14
00000000001c85af	popq	%r15
00000000001c85b1	popq	%rbp
00000000001c85b2	retq
00000000001c85b3	nopw	%cs:(%rax,%rax)
00000000001c85c0	xorps	%xmm1, %xmm1
00000000001c85c3	xorps	%xmm2, %xmm2
00000000001c85c6	movq	%r14, %rdi
00000000001c85c9	movl	$0x1, %esi
00000000001c85ce	movss	0x1ff6ea(%rip), %xmm3
00000000001c85d6	callq	*0x60(%rax)
00000000001c85d9	incl	%r13d
00000000001c85dc	movq	%r14, %r15
00000000001c85df	cmpl	0x19c(%rbx), %r13d
00000000001c85e6	jae	0x1c859a
00000000001c85e8	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000001c85ed	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001c85f2	movq	%rax, %r14
00000000001c85f5	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000001c85fa	movq	%rax, %rdi
00000000001c85fd	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000001c8602	movq	%r14, %rdi
00000000001c8605	callq	__ZN23HgcSimpleSpatialDenoiseC2Ev ## HgcSimpleSpatialDenoise::HgcSimpleSpatialDenoise()
00000000001c860a	movq	%r12, (%r14)
00000000001c860d	movq	%r14, %rdi
00000000001c8610	xorl	%esi, %esi
00000000001c8612	movq	%r15, %rdx
00000000001c8615	callq	__ZN6HGNode8SetInputEiPS_       ## HGNode::SetInput(int, HGNode*)
00000000001c861a	movq	(%r15), %rax
00000000001c861d	movq	%r15, %rdi
00000000001c8620	callq	*0x18(%rax)
00000000001c8623	movl	0x198(%rbx), %ecx
00000000001c8629	movq	(%r14), %rax
00000000001c862c	movq	0x60(%rax), %rax
00000000001c8630	cmpl	$0x1, %ecx
00000000001c8633	je	0x1c8660
00000000001c8635	xorps	%xmm3, %xmm3
00000000001c8638	movq	%r14, %rdi
00000000001c863b	xorl	%esi, %esi
00000000001c863d	movss	0x201caf(%rip), %xmm0
00000000001c8645	testl	%ecx, %ecx
00000000001c8647	jne	0x1c8680
00000000001c8649	movss	0x202383(%rip), %xmm1
00000000001c8651	movss	0x20306b(%rip), %xmm2
00000000001c8659	jmp	0x1c868b
00000000001c865b	nopl	(%rax,%rax)
00000000001c8660	xorps	%xmm2, %xmm2
00000000001c8663	xorps	%xmm3, %xmm3
00000000001c8666	movq	%r14, %rdi
00000000001c8669	xorl	%esi, %esi
00000000001c866b	movss	0x202361(%rip), %xmm0
00000000001c8673	movaps	%xmm0, %xmm1
00000000001c8676	jmp	0x1c868b
00000000001c8678	nopl	(%rax,%rax)
00000000001c8680	movaps	%xmm0, %xmm1
00000000001c8683	movss	0x1ff63d(%rip), %xmm2
00000000001c868b	callq	*%rax
00000000001c868d	movq	(%r14), %rax
00000000001c8690	cmpb	$0x0, 0x1a0(%rbx)
00000000001c8697	movss	0x1ff621(%rip), %xmm0
00000000001c869f	jne	0x1c85c0
00000000001c86a5	xorps	%xmm0, %xmm0
00000000001c86a8	jmp	0x1c85c0
00000000001c86ad	movq	%rax, %rbx
00000000001c86b0	movq	%r15, %r14
00000000001c86b3	movq	%r14, %rdi
00000000001c86b6	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001c86bb	movq	%rbx, %rdi
00000000001c86be	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001c86c3	jmp	0x1c86c5
00000000001c86c5	movq	%rax, %rbx
00000000001c86c8	movq	%r14, %rdi
00000000001c86cb	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001c86d0	movq	%rbx, %rdi
00000000001c86d3	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001c86d8	nopl	(%rax,%rax)
