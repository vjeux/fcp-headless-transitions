__ZNK29FFAudioPlaybackMediator_macOS16shouldPlayObjectEP16FFAnchoredObjectS1_:
0000000000e69750	pushq	%rbp
0000000000e69751	movq	%rsp, %rbp
0000000000e69754	pushq	%r15
0000000000e69756	pushq	%r14
0000000000e69758	pushq	%r12
0000000000e6975a	pushq	%rbx
0000000000e6975b	subq	$0x50, %rsp
0000000000e6975f	movq	%rdx, %rbx
0000000000e69762	movq	%rsi, %r14
0000000000e69765	movq	%rdi, %r15
0000000000e69768	callq	__ZNK23FFAudioPlaybackMediator16shouldPlayObjectEP16FFAnchoredObjectS1_ ## FFAudioPlaybackMediator::shouldPlayObject(FFAnchoredObject*, FFAnchoredObject*) const
0000000000e6976d	cmpb	$0x1, 0x68(%r15)
0000000000e69772	jne	0xe69806
0000000000e69778	movl	%eax, %r15d
0000000000e6977b	movq	0xd53f1e(%rip), %rsi
0000000000e69782	movq	%r14, %rdi
0000000000e69785	callq	*0xa83f35(%rip)                 ## Objc message: -[%rdi containedRolesForRoleKey:]
0000000000e6978b	testb	%al, %al
0000000000e6978d	je	0xe697a3
0000000000e6978f	movq	0xd53c42(%rip), %rsi
0000000000e69796	movq	%r14, %rdi
0000000000e69799	callq	*0xa83f21(%rip)                 ## Objc message: -[%rdi containedRolesForRoleKey:]
0000000000e6979f	testb	%al, %al
0000000000e697a1	je	0xe69813
0000000000e697a3	testb	%r15b, %r15b
0000000000e697a6	movb	$0x1, %al
0000000000e697a8	jne	0xe69806
0000000000e697aa	movq	$0x0, -0x40(%rbp)
0000000000e697b2	leaq	-0x40(%rbp), %rax
0000000000e697b6	movq	%rax, -0x38(%rbp)
0000000000e697ba	movabsq	$0x2020000000, %rax             ## imm = 0x2020000000
0000000000e697c4	movq	%rax, -0x30(%rbp)
0000000000e697c8	movb	$0x0, -0x28(%rbp)
0000000000e697cc	callq	__ZL29_objectsWithOpenEffectWindowsv ## _objectsWithOpenEffectWindows()
0000000000e697d1	movq	0xd4f4f8(%rip), %rsi
0000000000e697d8	movq	%rax, %rdi
0000000000e697db	movq	%rbx, %rdx
0000000000e697de	callq	*0xa83edc(%rip)                 ## Objc message: -[%rdi containedRolesForRoleKey:]
0000000000e697e4	testb	%al, %al
0000000000e697e6	movq	-0x38(%rbp), %rax
0000000000e697ea	setne	0x18(%rax)
0000000000e697ee	movq	-0x38(%rbp), %rax
0000000000e697f2	movzbl	0x18(%rax), %ebx
0000000000e697f6	leaq	-0x40(%rbp), %rdi
0000000000e697fa	movl	$0x8, %esi
0000000000e697ff	callq	0x1495cee                       ## symbol stub for: __Block_object_dispose
0000000000e69804	movl	%ebx, %eax
0000000000e69806	addq	$0x50, %rsp
0000000000e6980a	popq	%rbx
0000000000e6980b	popq	%r12
0000000000e6980d	popq	%r14
0000000000e6980f	popq	%r15
0000000000e69811	popq	%rbp
0000000000e69812	retq
0000000000e69813	movq	0xd538fe(%rip), %rsi
0000000000e6981a	movq	%r14, %rdi
0000000000e6981d	callq	*0xa83e9d(%rip)                 ## Objc message: -[%rdi containedRolesForRoleKey:]
0000000000e69823	testq	%rax, %rax
0000000000e69826	je	0xe6985d
0000000000e69828	movq	%rax, %r14
0000000000e6982b	movq	0xd5395e(%rip), %rsi
0000000000e69832	movq	0xa83e87(%rip), %r12            ## Objc message: -[%rdi containedRolesForRoleKey:]
0000000000e69839	movq	%rbx, %rdi
0000000000e6983c	callq	*%r12
0000000000e6983f	movq	0xd4f48a(%rip), %rsi
0000000000e69846	movq	%r14, %rdi
0000000000e69849	movq	%rax, %rdx
0000000000e6984c	callq	*%r12
0000000000e6984f	testb	%al, %al
0000000000e69851	setne	%al
0000000000e69854	testb	%r15b, %al
0000000000e69857	movb	$0x1, %al
0000000000e69859	jne	0xe69806
0000000000e6985b	jmp	0xe69864
0000000000e6985d	testb	%r15b, %r15b
0000000000e69860	movb	$0x1, %al
0000000000e69862	jne	0xe69806
0000000000e69864	movq	$0x0, -0x40(%rbp)
0000000000e6986c	leaq	-0x40(%rbp), %r15
0000000000e69870	movq	%r15, -0x38(%rbp)
0000000000e69874	movabsq	$0x2020000000, %rax             ## imm = 0x2020000000
0000000000e6987e	movq	%rax, -0x30(%rbp)
0000000000e69882	movb	$0x0, -0x28(%rbp)
0000000000e69886	callq	__ZL29_objectsWithOpenEffectWindowsv ## _objectsWithOpenEffectWindows()
0000000000e6988b	movq	%rax, %r14
0000000000e6988e	movq	0xd4ecbb(%rip), %rsi
0000000000e69895	movq	%rax, %rdi
0000000000e69898	callq	*0xa83e22(%rip)                 ## Objc message: -[%rdi containedRolesForRoleKey:]
0000000000e6989e	testq	%rax, %rax
0000000000e698a1	je	0xe697ee
0000000000e698a7	movq	0xa8428a(%rip), %rax            ## literal pool symbol address: __NSConcreteStackBlock
0000000000e698ae	movq	%rax, -0x70(%rbp)
0000000000e698b2	movl	$0xc2000000, %eax               ## imm = 0xC2000000
0000000000e698b7	movq	%rax, -0x68(%rbp)
0000000000e698bb	leaq	____ZNK29FFAudioPlaybackMediator_macOS16shouldPlayObjectEP16FFAnchoredObjectS1__block_invoke(%rip), %rax
0000000000e698c2	movq	%rax, -0x60(%rbp)
0000000000e698c6	leaq	"___block_descriptor_48_e8_32o40r_e32_v32?0\"FFAnchoredObject\"8*16*24l"(%rip), %rax
0000000000e698cd	movq	%rax, -0x58(%rbp)
0000000000e698d1	movq	%r14, -0x50(%rbp)
0000000000e698d5	movq	%r15, -0x48(%rbp)
0000000000e698d9	movq	0xd557b0(%rip), %rsi
0000000000e698e0	leaq	-0x70(%rbp), %rcx
0000000000e698e4	movq	%rbx, %rdi
0000000000e698e7	movl	$0x2, %edx
0000000000e698ec	callq	*0xa83dce(%rip)                 ## Objc message: -[%rdi containedRolesForRoleKey:]
0000000000e698f2	jmp	0xe697ee
0000000000e698f7	jmp	0xe698f9
0000000000e698f9	movq	%rax, %rbx
0000000000e698fc	leaq	-0x40(%rbp), %rdi
0000000000e69900	movl	$0x8, %esi
0000000000e69905	callq	0x1495cee                       ## symbol stub for: __Block_object_dispose
0000000000e6990a	movq	%rbx, %rdi
0000000000e6990d	callq	0x1495d30                       ## symbol stub for: __Unwind_Resume
0000000000e69912	nopw	%cs:(%rax,%rax)
