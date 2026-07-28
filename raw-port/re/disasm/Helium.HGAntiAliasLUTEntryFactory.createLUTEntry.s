__ZN26HGAntiAliasLUTEntryFactory14createLUTEntryEPN10HGLUTCache7LUTInfoEP10HGRenderer:
0000000000211320	pushq	%rbp
0000000000211321	movq	%rsp, %rbp
0000000000211324	pushq	%r15
0000000000211326	pushq	%r14
0000000000211328	pushq	%rbx
0000000000211329	pushq	%rax
000000000021132a	movq	%rdx, %r14
000000000021132d	movq	%rsi, %r15
0000000000211330	movl	$0x28, %edi
0000000000211335	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000021133a	movq	%rax, %rbx
000000000021133d	movq	%rax, %rdi
0000000000211340	movq	%r15, %rsi
0000000000211343	movq	%r14, %rdx
0000000000211346	callq	__ZN19HGAntiAliasLUTEntryC2EPN10HGLUTCache7LUTInfoEP10HGRenderer ## HGAntiAliasLUTEntry::HGAntiAliasLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)
000000000021134b	movq	%rbx, %rax
000000000021134e	addq	$0x8, %rsp
0000000000211352	popq	%rbx
0000000000211353	popq	%r14
0000000000211355	popq	%r15
0000000000211357	popq	%rbp
0000000000211358	retq
0000000000211359	movq	%rax, %r14
000000000021135c	movq	%rbx, %rdi
000000000021135f	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
0000000000211364	movq	%r14, %rdi
0000000000211367	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000021136c	nopl	(%rax)
