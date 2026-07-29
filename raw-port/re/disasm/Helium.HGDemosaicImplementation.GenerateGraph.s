__ZN24HGDemosaicImplementation13GenerateGraphEP10HGRendererP6HGNode:
00000000000dd560	pushq	%rbp
00000000000dd561	movq	%rsp, %rbp
00000000000dd564	pushq	%r15
00000000000dd566	pushq	%r14
00000000000dd568	pushq	%r12
00000000000dd56a	pushq	%rbx
00000000000dd56b	movq	%rdx, %r12
00000000000dd56e	movq	%rsi, %rbx
00000000000dd571	movq	%rdi, %r14
00000000000dd574	movq	(%rsi), %rax
00000000000dd577	movq	%rsi, %rdi
00000000000dd57a	callq	*0x130(%rax)
00000000000dd580	testb	%al, %al
00000000000dd582	jne	0xdd5b3
00000000000dd584	movq	(%rbx), %rax
00000000000dd587	movq	%rbx, %rdi
00000000000dd58a	movl	$0x2b, %esi
00000000000dd58f	callq	*0x80(%rax)
00000000000dd595	testl	%eax, %eax
00000000000dd597	je	0xdd5b3
00000000000dd599	movq	(%rbx), %rax
00000000000dd59c	movq	%rbx, %rdi
00000000000dd59f	movl	$0x2b, %esi
00000000000dd5a4	callq	*0x80(%rax)
00000000000dd5aa	cmpl	$0x1, %eax
00000000000dd5ad	jne	0xdd731
00000000000dd5b3	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000dd5b8	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000dd5bd	movq	%rax, %rbx
00000000000dd5c0	movq	%rax, %rdi
00000000000dd5c3	callq	__ZN13HgcDemosaic_1C2Ev         ## HgcDemosaic_1::HgcDemosaic_1()
00000000000dd5c8	leaq	0x92fb01(%rip), %rax
00000000000dd5cf	movq	%rax, (%rbx)
00000000000dd5d2	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000dd5d7	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000dd5dc	movq	%rax, %r15
00000000000dd5df	movq	%rax, %rdi
00000000000dd5e2	callq	__ZN13HgcDemosaic_2C2Ev         ## HgcDemosaic_2::HgcDemosaic_2()
00000000000dd5e7	leaq	0x92fd3a(%rip), %rax
00000000000dd5ee	movq	%rax, (%r15)
00000000000dd5f1	movq	(%rbx), %rax
00000000000dd5f4	movq	%rbx, %rdi
00000000000dd5f7	xorl	%esi, %esi
00000000000dd5f9	movq	%r12, %rdx
00000000000dd5fc	callq	*0x78(%rax)
00000000000dd5ff	movsd	0x18(%r14), %xmm1
00000000000dd605	movshdup	%xmm1, %xmm2                    ## xmm2 = xmm1[1,1,3,3]
00000000000dd609	movss	0xc(%r14), %xmm0
00000000000dd60f	movss	0x10(%r14), %xmm3
00000000000dd615	movq	(%rbx), %rax
00000000000dd618	movq	%rbx, %rdi
00000000000dd61b	xorl	%esi, %esi
00000000000dd61d	callq	*0x60(%rax)
00000000000dd620	movss	0x20(%r14), %xmm0
00000000000dd626	movss	0x24(%r14), %xmm1
00000000000dd62c	movss	0x28(%r14), %xmm2
00000000000dd632	movss	0x2c(%r14), %xmm3
00000000000dd638	movq	(%rbx), %rax
00000000000dd63b	movq	%rbx, %rdi
00000000000dd63e	movl	$0x1, %esi
00000000000dd643	callq	*0x60(%rax)
00000000000dd646	movsd	0x30(%r14), %xmm2
00000000000dd64c	movss	0x2ea66c(%rip), %xmm1
00000000000dd654	movaps	%xmm1, %xmm0
00000000000dd657	divss	%xmm2, %xmm0
00000000000dd65b	movshdup	%xmm2, %xmm2                    ## xmm2 = xmm2[1,1,3,3]
00000000000dd65f	divss	%xmm2, %xmm1
00000000000dd663	movss	0x14(%r14), %xmm2
00000000000dd669	movq	(%rbx), %rax
00000000000dd66c	xorps	%xmm3, %xmm3
00000000000dd66f	movq	%rbx, %rdi
00000000000dd672	movl	$0x2, %esi
00000000000dd677	callq	*0x60(%rax)
00000000000dd67a	movq	(%r15), %rax
00000000000dd67d	movq	%r15, %rdi
00000000000dd680	xorl	%esi, %esi
00000000000dd682	movq	%rbx, %rdx
00000000000dd685	callq	*0x78(%rax)
00000000000dd688	movss	0xc(%r14), %xmm0
00000000000dd68e	movsd	0x18(%r14), %xmm1
00000000000dd694	movshdup	%xmm1, %xmm2                    ## xmm2 = xmm1[1,1,3,3]
00000000000dd698	movq	(%r15), %rax
00000000000dd69b	xorps	%xmm3, %xmm3
00000000000dd69e	movq	%r15, %rdi
00000000000dd6a1	xorl	%esi, %esi
00000000000dd6a3	callq	*0x60(%rax)
00000000000dd6a6	movss	0x20(%r14), %xmm0
00000000000dd6ac	movss	0x24(%r14), %xmm1
00000000000dd6b2	movss	0x28(%r14), %xmm2
00000000000dd6b8	movss	0x2c(%r14), %xmm3
00000000000dd6be	movq	(%r15), %rax
00000000000dd6c1	movq	%r15, %rdi
00000000000dd6c4	movl	$0x1, %esi
00000000000dd6c9	callq	*0x60(%rax)
00000000000dd6cc	movsd	0x30(%r14), %xmm0
00000000000dd6d2	movshdup	%xmm0, %xmm1                    ## xmm1 = xmm0[1,1,3,3]
00000000000dd6d6	movq	(%r15), %rax
00000000000dd6d9	xorps	%xmm2, %xmm2
00000000000dd6dc	xorps	%xmm3, %xmm3
00000000000dd6df	movq	%r15, %rdi
00000000000dd6e2	movl	$0x2, %esi
00000000000dd6e7	callq	*0x60(%rax)
00000000000dd6ea	movq	0x38(%r14), %r12
00000000000dd6ee	cmpq	%r15, %r12
00000000000dd6f1	je	0xdd713
00000000000dd6f3	testq	%r12, %r12
00000000000dd6f6	je	0xdd702
00000000000dd6f8	movq	(%r12), %rax
00000000000dd6fc	movq	%r12, %rdi
00000000000dd6ff	callq	*0x18(%rax)
00000000000dd702	movq	%r15, 0x38(%r14)
00000000000dd706	movq	(%r15), %rax
00000000000dd709	movq	%r15, %rdi
00000000000dd70c	callq	*0x10(%rax)
00000000000dd70f	movq	0x38(%r14), %r12
00000000000dd713	movq	(%r15), %rax
00000000000dd716	movq	%r15, %rdi
00000000000dd719	callq	*0x18(%rax)
00000000000dd71c	movq	(%rbx), %rax
00000000000dd71f	movq	%rbx, %rdi
00000000000dd722	callq	*0x18(%rax)
00000000000dd725	movq	%r12, %rax
00000000000dd728	popq	%rbx
00000000000dd729	popq	%r12
00000000000dd72b	popq	%r14
00000000000dd72d	popq	%r15
00000000000dd72f	popq	%rbp
00000000000dd730	retq
00000000000dd731	xorl	%r12d, %r12d
00000000000dd734	jmp	0xdd725
00000000000dd736	movq	%rax, %rdi
00000000000dd739	callq	___clang_call_terminate
00000000000dd73e	movq	%rax, %rdi
00000000000dd741	callq	___clang_call_terminate
00000000000dd746	movq	%rax, %r14
00000000000dd749	movq	%r15, %rdi
00000000000dd74c	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000dd751	jmp	0xdd777
00000000000dd753	movq	%rax, %r14
00000000000dd756	jmp	0xdd777
00000000000dd758	movq	%rax, %r14
00000000000dd75b	movq	%rbx, %rdi
00000000000dd75e	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000dd763	movq	%r14, %rdi
00000000000dd766	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000dd76b	movq	%rax, %r14
00000000000dd76e	movq	(%r15), %rax
00000000000dd771	movq	%r15, %rdi
00000000000dd774	callq	*0x18(%rax)
00000000000dd777	movq	(%rbx), %rax
00000000000dd77a	movq	%rbx, %rdi
00000000000dd77d	callq	*0x18(%rax)
00000000000dd780	movq	%r14, %rdi
00000000000dd783	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000dd788	movq	%rax, %rdi
00000000000dd78b	callq	___clang_call_terminate
00000000000dd790	movq	%rax, %rdi
00000000000dd793	callq	___clang_call_terminate
00000000000dd798	nopl	(%rax,%rax)
