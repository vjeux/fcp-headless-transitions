__ZNK33HG_ERsRGBToneCurveToLinearLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE:
0000000000115330	pushq	%rbp
0000000000115331	movq	%rsp, %rbp
0000000000115334	pushq	%rbx
0000000000115335	pushq	%rax
0000000000115336	testq	%rsi, %rsi
0000000000115339	je	0x11536f
000000000011533b	movq	%rdi, %rbx
000000000011533e	movq	0x8ecf9b(%rip), %rax            ## literal pool symbol address: __ZTIN10HGLUTCache7LUTInfoE
0000000000115345	leaq	__ZTI33HG_ERsRGBToneCurveToLinearLUTInfo(%rip), %rdx ## typeinfo for HG_ERsRGBToneCurveToLinearLUTInfo
000000000011534c	movq	%rsi, %rdi
000000000011534f	movq	%rax, %rsi
0000000000115352	xorl	%ecx, %ecx
0000000000115354	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
0000000000115359	testq	%rax, %rax
000000000011535c	je	0x11536f
000000000011535e	movq	%rbx, %rdi
0000000000115361	movq	%rax, %rsi
0000000000115364	addq	$0x8, %rsp
0000000000115368	popq	%rbx
0000000000115369	popq	%rbp
000000000011536a	jmp	__ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE ## HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const
000000000011536f	xorl	%eax, %eax
0000000000115371	addq	$0x8, %rsp
0000000000115375	popq	%rbx
0000000000115376	popq	%rbp
0000000000115377	retq
0000000000115378	nopl	(%rax,%rax)
