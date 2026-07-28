__ZN9PCHash1287addDataEPKhj:
000000000001bf52	pushq	%rbp
000000000001bf53	movq	%rsp, %rbp
000000000001bf56	pushq	%r15
000000000001bf58	pushq	%r14
000000000001bf5a	pushq	%r13
000000000001bf5c	pushq	%r12
000000000001bf5e	pushq	%rbx
000000000001bf5f	subq	$0x48, %rsp
000000000001bf63	movl	%edx, %r14d
000000000001bf66	movq	%rsi, %r15
000000000001bf69	movq	%rdi, %rbx
000000000001bf6c	movq	0x12c2ad(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
000000000001bf73	movq	(%rax), %rax
000000000001bf76	movq	%rax, -0x30(%rbp)
000000000001bf7a	movdqu	(%rdi), %xmm0
000000000001bf7e	ptest	%xmm0, %xmm0
000000000001bf83	jne	0x1bf91
000000000001bf85	movdqa	0x1076a3(%rip), %xmm0
000000000001bf8d	movdqu	%xmm0, (%rbx)
000000000001bf91	cmpl	$0x40, %r14d
000000000001bf95	jb	0x1bff0
000000000001bf97	leaq	-0x70(%rbp), %r13
000000000001bf9b	movq	%r15, %r12
000000000001bf9e	testb	$0x3, %r15b
000000000001bfa2	je	0x1bfd5
000000000001bfa4	movdqu	(%r12), %xmm0
000000000001bfaa	movups	0x10(%r12), %xmm1
000000000001bfb0	movups	0x20(%r12), %xmm2
000000000001bfb6	movups	0x30(%r12), %xmm3
000000000001bfbc	movaps	%xmm3, -0x40(%rbp)
000000000001bfc0	movaps	%xmm2, -0x50(%rbp)
000000000001bfc4	movaps	%xmm1, -0x60(%rbp)
000000000001bfc8	movdqa	%xmm0, -0x70(%rbp)
000000000001bfcd	movq	%rbx, %rdi
000000000001bfd0	movq	%r13, %rsi
000000000001bfd3	jmp	0x1bfdb
000000000001bfd5	movq	%rbx, %rdi
000000000001bfd8	movq	%r12, %rsi
000000000001bfdb	callq	__ZN9PCHash1289transformEPKj    ## PCHash128::transform(unsigned int const*)
000000000001bfe0	addq	$0x40, %r12
000000000001bfe4	addl	$-0x40, %r14d
000000000001bfe8	cmpl	$0x3f, %r14d
000000000001bfec	ja	0x1bf9e
000000000001bfee	jmp	0x1bff3
000000000001bff0	movq	%r15, %r12
000000000001bff3	testl	%r14d, %r14d
000000000001bff6	je	0x1c038
000000000001bff8	movl	$0x40, %r15d
000000000001bffe	subl	%r14d, %r15d
000000000001c001	movl	%r14d, %r14d
000000000001c004	leaq	-0x70(%rbp), %r13
000000000001c008	movq	%r13, %rdi
000000000001c00b	movq	%r12, %rsi
000000000001c00e	movq	%r14, %rdx
000000000001c011	callq	0xde960                         ## symbol stub for: _memcpy
000000000001c016	leaq	(%r14,%rbp), %rdi
000000000001c01a	addq	$-0x70, %rdi
000000000001c01e	leaq	__ZL7PADDING(%rip), %rsi        ## PADDING
000000000001c025	movq	%r15, %rdx
000000000001c028	callq	0xde960                         ## symbol stub for: _memcpy
000000000001c02d	movq	%rbx, %rdi
000000000001c030	movq	%r13, %rsi
000000000001c033	callq	__ZN9PCHash1289transformEPKj    ## PCHash128::transform(unsigned int const*)
000000000001c038	movq	0x12c1e1(%rip), %rax            ## literal pool symbol address: ___stack_chk_guard
000000000001c03f	movq	(%rax), %rax
000000000001c042	cmpq	-0x30(%rbp), %rax
000000000001c046	jne	0x1c057
000000000001c048	addq	$0x48, %rsp
000000000001c04c	popq	%rbx
000000000001c04d	popq	%r12
000000000001c04f	popq	%r13
000000000001c051	popq	%r14
000000000001c053	popq	%r15
000000000001c055	popq	%rbp
000000000001c056	retq
000000000001c057	callq	0xde744                         ## symbol stub for: ___stack_chk_fail
