__ZN14HGMetalHandler20_commitCommandBufferEv:
000000000015df50	pushq	%rbp
000000000015df51	movq	%rsp, %rbp
000000000015df54	pushq	%r15
000000000015df56	pushq	%r14
000000000015df58	pushq	%r12
000000000015df5a	pushq	%rbx
000000000015df5b	subq	$0xd0, %rsp
000000000015df62	movq	%rdi, %rbx
000000000015df65	leaq	0x7987b4(%rip), %rsi            ## literal pool for: "metal"
000000000015df6c	leaq	0x78bfd2(%rip), %rcx            ## literal pool for: "HGMetalHandler::_commitCommandBuffer()"
000000000015df73	leaq	-0x80(%rbp), %rdi
000000000015df77	movl	$0x2, %edx
000000000015df7c	callq	__ZN12HGTraceGuardC1EPKciS1_    ## HGTraceGuard::HGTraceGuard(char const*, int, char const*)
000000000015df81	cmpb	$0x1, 0x70a(%rbx)
000000000015df88	leaq	-0x40(%rbp), %r15
000000000015df8c	movabsq	$0x2020000000, %r14             ## imm = 0x2020000000
000000000015df96	jne	0x15e04b
000000000015df9c	movzbl	0x70b(%rbx), %r12d
000000000015dfa4	movq	$0x0, -0x40(%rbp)
000000000015dfac	movq	%r15, -0x38(%rbp)
000000000015dfb0	movq	%r14, -0x30(%rbp)
000000000015dfb4	movq	0x138(%rbx), %rax
000000000015dfbb	movq	%rax, -0x28(%rbp)
000000000015dfbf	movl	$0x18, %edi
000000000015dfc4	callq	0x3c4fb2                        ## symbol stub for: __Znwm
000000000015dfc9	xorps	%xmm0, %xmm0
000000000015dfcc	movups	%xmm0, (%rax)
000000000015dfcf	movq	$0x0, 0x10(%rax)
000000000015dfd7	movq	%rax, 0x138(%rbx)
000000000015dfde	movq	0x100(%rbx), %rdi
000000000015dfe5	movq	0x8a4264(%rip), %rax            ## literal pool symbol address: __NSConcreteStackBlock
000000000015dfec	movq	%rax, -0xb0(%rbp)
000000000015dff3	movl	$0xc2000000, %eax               ## imm = 0xC2000000
000000000015dff8	movq	%rax, -0xa8(%rbp)
000000000015dfff	leaq	____ZN14HGMetalHandler20_commitCommandBufferEv_block_invoke(%rip), %rax
000000000015e006	movq	%rax, -0xa0(%rbp)
000000000015e00d	leaq	"___block_descriptor_41_e8_32r_e28_v16?0\"<MTLCommandBuffer>\"8l"(%rip), %rax
000000000015e014	movq	%rax, -0x98(%rbp)
000000000015e01b	movq	%r15, -0x90(%rbp)
000000000015e022	movb	%r12b, -0x88(%rbp)
