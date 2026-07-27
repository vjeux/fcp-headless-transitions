__ZN12AUFaderLevelD0Ev:
0000000001244890	pushq	%rbp
0000000001244891	movq	%rsp, %rbp
0000000001244894	pushq	%r15
0000000001244896	pushq	%r14
0000000001244898	pushq	%rbx
0000000001244899	pushq	%rax
000000000124489a	movq	%rdi, %rbx
000000000124489d	movq	0x6a3b44(%rip), %rax            ## literal pool symbol address: __ZTVN5ausdk12AUEffectBaseE
00000000012448a4	addq	$0x10, %rax
00000000012448a8	movq	%rax, (%rdi)
00000000012448ab	movq	0x250(%rdi), %r14
00000000012448b2	testq	%r14, %r14
00000000012448b5	je	0x1244905
00000000012448b7	movq	0x258(%rbx), %r15
00000000012448be	movq	%r14, %rdi
00000000012448c1	cmpq	%r15, %r14
00000000012448c4	jne	0x12448d9
00000000012448c6	jmp	0x12448f9
00000000012448c8	nopl	(%rax,%rax)
00000000012448d0	addq	$-0x8, %r15
00000000012448d4	cmpq	%r14, %r15
00000000012448d7	je	0x12448f2
00000000012448d9	movq	-0x8(%r15), %rdi
00000000012448dd	movq	$0x0, -0x8(%r15)
00000000012448e5	testq	%rdi, %rdi
00000000012448e8	je	0x12448d0
00000000012448ea	movq	(%rdi), %rax
00000000012448ed	callq	*0x8(%rax)
00000000012448f0	jmp	0x12448d0
00000000012448f2	movq	0x250(%rbx), %rdi
00000000012448f9	movq	%r14, 0x258(%rbx)
0000000001244900	callq	0x1497404                       ## symbol stub for: __ZdlPv
0000000001244905	movq	%rbx, %rdi
0000000001244908	callq	0x1496bc4                       ## symbol stub for: __ZN5ausdk6AUBaseD2Ev
000000000124490d	movq	%rbx, %rdi
0000000001244910	addq	$0x8, %rsp
0000000001244914	popq	%rbx
0000000001244915	popq	%r14
0000000001244917	popq	%r15
0000000001244919	popq	%rbp
000000000124491a	jmp	0x1497404                       ## symbol stub for: __ZdlPv
000000000124491f	addb	%dl, 0x48(%rbp)
0000000001244922	movl	%esp, %ebp
0000000001244924	leaq	__ZN5ausdk9APFactoryINS_12AUBaseLookupE11AUTrimLevelE7FactoryEPK25AudioComponentDescription(%rip), %rdi ## ausdk::APFactory<ausdk::AUBaseLookup, AUTrimLevel>::Factory(AudioComponentDescription const*)
000000000124492b	movl	$0x7472696d, %esi               ## imm = 0x7472696D
0000000001244930	callq	__ZN19STBuiltinAudioUnits17DeferRegistrationEPFP29AudioComponentPlugInInterfacePK25AudioComponentDescriptionEj ## STBuiltinAudioUnits::DeferRegistration(AudioComponentPlugInInterface* (*)(AudioComponentDescription const*), unsigned int)
0000000001244935	leaq	__ZN5ausdk9APFactoryINS_12AUBaseLookupE12AUFaderLevelE7FactoryEPK25AudioComponentDescription(%rip), %rdi ## ausdk::APFactory<ausdk::AUBaseLookup, AUFaderLevel>::Factory(AudioComponentDescription const*)
000000000124493c	movl	$0x66616472, %esi               ## imm = 0x66616472
0000000001244941	popq	%rbp
0000000001244942	jmp	__ZN19STBuiltinAudioUnits17DeferRegistrationEPFP29AudioComponentPlugInInterfacePK25AudioComponentDescriptionEj ## STBuiltinAudioUnits::DeferRegistration(AudioComponentPlugInInterface* (*)(AudioComponentDescription const*), unsigned int)
0000000001244947	addb	%al, (%rax)
0000000001244949	addb	%al, (%rax)
000000000124494b	addb	%al, (%rax)
000000000124494d	addb	%al, (%rax)
000000000124494f	addb	%dl, 0x48(%rbp)
0000000001244952	movl	%esp, %ebp
0000000001244954	pushq	%r14
0000000001244956	pushq	%rbx
0000000001244957	movq	%rdi, %rbx
000000000124495a	xorl	%r14d, %r14d
000000000124495d	movl	$0x100, %edx                    ## imm = 0x100
0000000001244962	movl	$0x1, %ecx
0000000001244967	xorl	%r8d, %r8d
000000000124496a	callq	0x1496bbe                       ## symbol stub for: __ZN5ausdk6AUBaseC2EP23ComponentInstanceRecordjjj
000000000124496f	leaq	0x6db022(%rip), %rax
0000000001244976	movq	%rax, (%rbx)
0000000001244979	movb	$0x1, 0x250(%rbx)
0000000001244980	movb	$0x0, 0x351(%rbx)
0000000001244987	movl	$0x0, 0x354(%rbx)
0000000001244991	nopw	%cs:(%rax,%rax)
00000000012449a0	movb	$0x0, 0x251(%rbx,%r14)
00000000012449a9	movb	$0x0, 0x252(%rbx,%r14)
00000000012449b2	movb	$0x0, 0x253(%rbx,%r14)
00000000012449bb	movb	$0x0, 0x254(%rbx,%r14)
00000000012449c4	movb	$0x0, 0x255(%rbx,%r14)
00000000012449cd	movb	$0x0, 0x256(%rbx,%r14)
00000000012449d6	movb	$0x0, 0x257(%rbx,%r14)
00000000012449df	movb	$0x0, 0x258(%rbx,%r14)
00000000012449e8	addq	$0x8, %r14
00000000012449ec	cmpq	$0x100, %r14                    ## imm = 0x100
00000000012449f3	jne	0x12449a0
00000000012449f5	popq	%rbx
00000000012449f6	popq	%r14
00000000012449f8	popq	%rbp
00000000012449f9	retq
00000000012449fa	nopw	(%rax,%rax)
