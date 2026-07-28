__ZNK30HGLinearToAYCCToneCurveLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE:
0000000000115210	pushq	%rbp
0000000000115211	movq	%rsp, %rbp
0000000000115214	pushq	%rbx
0000000000115215	pushq	%rax
0000000000115216	testq	%rsi, %rsi
0000000000115219	je	0x11524f
000000000011521b	movq	%rdi, %rbx
000000000011521e	movq	0x8ed0bb(%rip), %rax            ## literal pool symbol address: __ZTIN10HGLUTCache7LUTInfoE
0000000000115225	leaq	__ZTI30HGLinearToAYCCToneCurveLUTInfo(%rip), %rdx ## typeinfo for HGLinearToAYCCToneCurveLUTInfo
000000000011522c	movq	%rsi, %rdi
000000000011522f	movq	%rax, %rsi
0000000000115232	xorl	%ecx, %ecx
0000000000115234	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
0000000000115239	testq	%rax, %rax
000000000011523c	je	0x11524f
000000000011523e	movq	%rbx, %rdi
0000000000115241	movq	%rax, %rsi
0000000000115244	addq	$0x8, %rsp
0000000000115248	popq	%rbx
0000000000115249	popq	%rbp
000000000011524a	jmp	__ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE ## HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const
000000000011524f	xorl	%eax, %eax
0000000000115251	addq	$0x8, %rsp
0000000000115255	popq	%rbx
0000000000115256	popq	%rbp
0000000000115257	retq
0000000000115258	nopl	(%rax,%rax)
