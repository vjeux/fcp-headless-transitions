__ZN13HGGradeDeltaE9GetOutputEP10HGRenderer:
00000000000da3e0	pushq	%rbp
00000000000da3e1	movq	%rsp, %rbp
00000000000da3e4	pushq	%r15
00000000000da3e6	pushq	%r14
00000000000da3e8	pushq	%rbx
00000000000da3e9	pushq	%rax
00000000000da3ea	movq	%rsi, %r14
00000000000da3ed	movq	%rdi, %rbx
00000000000da3f0	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000da3f5	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000da3fa	movq	%rax, %r15
00000000000da3fd	movq	%rax, %rdi
00000000000da400	callq	__ZN14HgcGradeDeltaEC1Ev        ## HgcGradeDeltaE::HgcGradeDeltaE()
00000000000da405	movq	0x1a0(%rbx), %rdi
00000000000da40c	cmpq	%r15, %rdi
00000000000da40f	je	0xda425
00000000000da411	testq	%rdi, %rdi
00000000000da414	je	0xda41c
00000000000da416	movq	(%rdi), %rax
00000000000da419	callq	*0x18(%rax)
00000000000da41c	movq	%r15, 0x1a0(%rbx)
00000000000da423	jmp	0xda433
00000000000da425	testq	%r15, %r15
00000000000da428	je	0xda433
00000000000da42a	movq	(%r15), %rax
00000000000da42d	movq	%r15, %rdi
00000000000da430	callq	*0x18(%rax)
00000000000da433	movl	0x19c(%rbx), %eax
00000000000da439	testl	%eax, %eax
00000000000da43b	je	0xda4a1
00000000000da43d	cmpl	$0x1, %eax
00000000000da440	je	0xda473
00000000000da442	cmpl	$0x2, %eax
00000000000da445	jne	0xda4c1
00000000000da447	movq	0x1a0(%rbx), %rdi
00000000000da44e	movss	0x198(%rbx), %xmm0
00000000000da456	movq	(%rdi), %rax
00000000000da459	movss	0x2ed85f(%rip), %xmm1
00000000000da461	movss	0x2f4753(%rip), %xmm2
00000000000da469	movss	0x2f474f(%rip), %xmm3
00000000000da471	jmp	0xda49d
00000000000da473	movq	0x1a0(%rbx), %rdi
00000000000da47a	movss	0x198(%rbx), %xmm0
00000000000da482	movq	(%rdi), %rax
00000000000da485	movss	0x2ed83b(%rip), %xmm1
00000000000da48d	movss	0x2ed82b(%rip), %xmm2
00000000000da495	movss	0x2efe53(%rip), %xmm3
00000000000da49d	xorl	%esi, %esi
00000000000da49f	jmp	0xda4be
00000000000da4a1	movq	0x1a0(%rbx), %rdi
00000000000da4a8	movss	0x198(%rbx), %xmm0
00000000000da4b0	movq	(%rdi), %rax
00000000000da4b3	xorl	%esi, %esi
00000000000da4b5	movaps	%xmm0, %xmm1
00000000000da4b8	movaps	%xmm0, %xmm2
00000000000da4bb	movaps	%xmm0, %xmm3
00000000000da4be	callq	*0x60(%rax)
00000000000da4c1	movq	%r14, %rdi
00000000000da4c4	movq	%rbx, %rsi
00000000000da4c7	xorl	%edx, %edx
00000000000da4c9	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000da4ce	movq	0x1a0(%rbx), %rdi
00000000000da4d5	movq	(%rdi), %rcx
00000000000da4d8	xorl	%esi, %esi
00000000000da4da	movq	%rax, %rdx
00000000000da4dd	callq	*0x78(%rcx)
00000000000da4e0	movq	0x1a0(%rbx), %rax
00000000000da4e7	addq	$0x8, %rsp
00000000000da4eb	popq	%rbx
00000000000da4ec	popq	%r14
00000000000da4ee	popq	%r15
00000000000da4f0	popq	%rbp
00000000000da4f1	retq
00000000000da4f2	movq	%rax, %rdi
00000000000da4f5	callq	___clang_call_terminate
00000000000da4fa	movq	%rax, %rbx
00000000000da4fd	testq	%r15, %r15
00000000000da500	je	0xda520
00000000000da502	movq	(%r15), %rax
00000000000da505	movq	%r15, %rdi
00000000000da508	callq	*0x18(%rax)
00000000000da50b	jmp	0xda520
00000000000da50d	movq	%rax, %rdi
00000000000da510	callq	___clang_call_terminate
00000000000da515	movq	%rax, %rbx
00000000000da518	movq	%r15, %rdi
00000000000da51b	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000da520	movq	%rbx, %rdi
00000000000da523	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000da528	nopl	(%rax,%rax)
