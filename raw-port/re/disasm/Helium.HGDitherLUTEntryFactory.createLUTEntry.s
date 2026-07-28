__ZN23HGDitherLUTEntryFactory14createLUTEntryEPN10HGLUTCache7LUTInfoEP10HGRenderer:
000000000006fe80	pushq	%rbp
000000000006fe81	movq	%rsp, %rbp
000000000006fe84	pushq	%r15
000000000006fe86	pushq	%r14
000000000006fe88	pushq	%rbx
000000000006fe89	pushq	%rax
000000000006fe8a	movq	%rdx, %r14
000000000006fe8d	movq	%rsi, %r15
000000000006fe90	movl	$0x28, %edi
000000000006fe95	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000006fe9a	movq	%rax, %rbx
000000000006fe9d	movq	%rax, %rdi
000000000006fea0	movq	%r15, %rsi
000000000006fea3	movq	%r14, %rdx
000000000006fea6	callq	__ZN16HGDitherLUTEntryC2EPN10HGLUTCache7LUTInfoEP10HGRenderer ## HGDitherLUTEntry::HGDitherLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)
000000000006feab	movq	%rbx, %rax
000000000006feae	addq	$0x8, %rsp
000000000006feb2	popq	%rbx
000000000006feb3	popq	%r14
000000000006feb5	popq	%r15
000000000006feb7	popq	%rbp
000000000006feb8	retq
000000000006feb9	movq	%rax, %r14
000000000006febc	movq	%rbx, %rdi
000000000006febf	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
000000000006fec4	movq	%r14, %rdi
000000000006fec7	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000006fecc	nopl	(%rax)
