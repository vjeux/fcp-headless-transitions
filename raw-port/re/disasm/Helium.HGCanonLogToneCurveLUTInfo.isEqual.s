__ZNK26HGCanonLogToneCurveLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE:
0000000000113990	pushq	%rbp
0000000000113991	movq	%rsp, %rbp
0000000000113994	pushq	%rbx
0000000000113995	pushq	%rax
0000000000113996	testq	%rsi, %rsi
0000000000113999	je	0x1139cf
000000000011399b	movq	%rdi, %rbx
000000000011399e	movq	0x8ee93b(%rip), %rax            ## literal pool symbol address: __ZTIN10HGLUTCache7LUTInfoE
00000000001139a5	leaq	__ZTI26HGCanonLogToneCurveLUTInfo(%rip), %rdx ## typeinfo for HGCanonLogToneCurveLUTInfo
00000000001139ac	movq	%rsi, %rdi
00000000001139af	movq	%rax, %rsi
00000000001139b2	xorl	%ecx, %ecx
00000000001139b4	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000001139b9	testq	%rax, %rax
00000000001139bc	je	0x1139cf
00000000001139be	movq	%rbx, %rdi
00000000001139c1	movq	%rax, %rsi
00000000001139c4	addq	$0x8, %rsp
00000000001139c8	popq	%rbx
00000000001139c9	popq	%rbp
00000000001139ca	jmp	__ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE ## HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const
00000000001139cf	xorl	%eax, %eax
00000000001139d1	addq	$0x8, %rsp
00000000001139d5	popq	%rbx
00000000001139d6	popq	%rbp
00000000001139d7	retq
00000000001139d8	nopl	(%rax,%rax)
