__ZNK33HGBMDFilmGen5LinearizationLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE:
00000000001148f0	pushq	%rbp
00000000001148f1	movq	%rsp, %rbp
00000000001148f4	pushq	%rbx
00000000001148f5	pushq	%rax
00000000001148f6	testq	%rsi, %rsi
00000000001148f9	je	0x11492f
00000000001148fb	movq	%rdi, %rbx
00000000001148fe	movq	0x8ed9db(%rip), %rax            ## literal pool symbol address: __ZTIN10HGLUTCache7LUTInfoE
0000000000114905	leaq	__ZTI33HGBMDFilmGen5LinearizationLUTInfo(%rip), %rdx ## typeinfo for HGBMDFilmGen5LinearizationLUTInfo
000000000011490c	movq	%rsi, %rdi
000000000011490f	movq	%rax, %rsi
0000000000114912	xorl	%ecx, %ecx
0000000000114914	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
0000000000114919	testq	%rax, %rax
000000000011491c	je	0x11492f
000000000011491e	movq	%rbx, %rdi
0000000000114921	movq	%rax, %rsi
0000000000114924	addq	$0x8, %rsp
0000000000114928	popq	%rbx
0000000000114929	popq	%rbp
000000000011492a	jmp	__ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE ## HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const
000000000011492f	xorl	%eax, %eax
0000000000114931	addq	$0x8, %rsp
0000000000114935	popq	%rbx
0000000000114936	popq	%rbp
0000000000114937	retq
0000000000114938	nopl	(%rax,%rax)
