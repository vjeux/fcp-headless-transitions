__ZN25HgcCopyMaskRGBToMaskAlphaC2Ev:
00000000006a2bb0	pushq	%rbp
00000000006a2bb1	movq	%rsp, %rbp
00000000006a2bb4	subq	$0x30, %rsp
00000000006a2bb8	movq	%rdi, -0x8(%rbp)
00000000006a2bbc	movq	-0x8(%rbp), %rdi
00000000006a2bc0	movq	%rdi, -0x28(%rbp)
00000000006a2bc4	callq	0x6dd7be                        ## symbol stub for: __ZN13HGColorMatrixC2Ev
00000000006a2bc9	movq	-0x28(%rbp), %rax
00000000006a2bcd	leaq	0x1e82dc(%rip), %rcx
00000000006a2bd4	movq	%rcx, (%rax)
00000000006a2bd7	movl	$0x1, 0x1f8(%rax)
00000000006a2be1	movl	$0x100, %edi                    ## imm = 0x100
00000000006a2be6	callq	__ZN16HgcCombineFields5StatenwEm ## HgcCombineFields::State::operator new(unsigned long)
00000000006a2beb	movq	%rax, -0x20(%rbp)
00000000006a2bef	jmp	0x6a2bf1
00000000006a2bf1	movq	-0x20(%rbp), %rdi
00000000006a2bf5	callq	__ZN25HgcCopyMaskRGBToMaskAlpha5StateC1Ev ## HgcCopyMaskRGBToMaskAlpha::State::State()
00000000006a2bfa	jmp	0x6a2bfc
00000000006a2bfc	movq	-0x28(%rbp), %rax
00000000006a2c00	movq	-0x20(%rbp), %rcx
00000000006a2c04	movq	%rcx, 0x1f0(%rax)
00000000006a2c0b	movl	0x10(%rax), %ecx
00000000006a2c0e	orl	$0x400, %ecx                    ## imm = 0x400
00000000006a2c14	movl	%ecx, 0x10(%rax)
00000000006a2c17	movl	0x10(%rax), %ecx
00000000006a2c1a	andl	$0xfffffdff, %ecx               ## imm = 0xFFFFFDFF
00000000006a2c20	movl	%ecx, 0x10(%rax)
00000000006a2c23	addq	$0x30, %rsp
00000000006a2c27	popq	%rbp
00000000006a2c28	retq
00000000006a2c29	movq	%rax, %rcx
00000000006a2c2c	movl	%edx, %eax
00000000006a2c2e	movq	%rcx, -0x10(%rbp)
00000000006a2c32	movl	%eax, -0x14(%rbp)
00000000006a2c35	jmp	0x6a2c4c
00000000006a2c37	movq	-0x20(%rbp), %rdi
00000000006a2c3b	movq	%rax, %rcx
00000000006a2c3e	movl	%edx, %eax
00000000006a2c40	movq	%rcx, -0x10(%rbp)
00000000006a2c44	movl	%eax, -0x14(%rbp)
00000000006a2c47	callq	__ZN25HgcCopyMaskRGBToMaskAlpha5StatedlEPv ## HgcCopyMaskRGBToMaskAlpha::State::operator delete(void*)
00000000006a2c4c	movq	-0x28(%rbp), %rdi
00000000006a2c50	callq	0x6dd7c4                        ## symbol stub for: __ZN13HGColorMatrixD2Ev
00000000006a2c55	movq	-0x10(%rbp), %rdi
00000000006a2c59	callq	0x6dd07a                        ## symbol stub for: __Unwind_Resume
00000000006a2c5e	nop
