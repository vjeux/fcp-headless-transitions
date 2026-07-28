__ZN9HGBindingC1ENS_9AttributeEPKcjNS_9AddrSpaceEjt:
0000000000687540	pushq	%rbp
0000000000687541	movq	%rsp, %rbp
0000000000687544	subq	$0x30, %rsp
0000000000687548	movw	0x10(%rbp), %ax
000000000068754c	movq	%rdi, -0x8(%rbp)
0000000000687550	movl	%esi, -0xc(%rbp)
0000000000687553	movq	%rdx, -0x18(%rbp)
0000000000687557	movl	%ecx, -0x1c(%rbp)
000000000068755a	movl	%r8d, -0x20(%rbp)
000000000068755e	movl	%r9d, -0x24(%rbp)
0000000000687562	movq	-0x8(%rbp), %rdi
0000000000687566	movl	-0xc(%rbp), %esi
0000000000687569	movq	-0x18(%rbp), %rdx
000000000068756d	movl	-0x1c(%rbp), %ecx
0000000000687570	movl	-0x20(%rbp), %r8d
0000000000687574	movl	-0x24(%rbp), %r9d
0000000000687578	movzwl	0x10(%rbp), %eax
000000000068757c	movl	%eax, (%rsp)
000000000068757f	callq	__ZN9HGBindingC2ENS_9AttributeEPKcjNS_9AddrSpaceEjt ## HGBinding::HGBinding(HGBinding::Attribute, char const*, unsigned int, HGBinding::AddrSpace, unsigned int, unsigned short)
0000000000687584	addq	$0x30, %rsp
0000000000687588	popq	%rbp
0000000000687589	retq
000000000068758a	nopw	(%rax,%rax)
__ZN9HGBindingD1Ev:
0000000000687590	pushq	%rbp
0000000000687591	movq	%rsp, %rbp
0000000000687594	subq	$0x10, %rsp
0000000000687598	movq	%rdi, -0x8(%rbp)
000000000068759c	movq	-0x8(%rbp), %rdi
00000000006875a0	callq	__ZN9HGBindingD2Ev              ## HGBinding::~HGBinding()
00000000006875a5	addq	$0x10, %rsp
00000000006875a9	popq	%rbp
00000000006875aa	retq
00000000006875ab	nopl	(%rax,%rax)
__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEEC1B9dee210106Ev:
00000000006875b0	pushq	%rbp
00000000006875b1	movq	%rsp, %rbp
00000000006875b4	subq	$0x10, %rsp
00000000006875b8	movq	%rdi, -0x8(%rbp)
00000000006875bc	movq	-0x8(%rbp), %rdi
00000000006875c0	callq	__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEEC2B9dee210106Ev ## std::__1::vector<HGBinding, std::__1::allocator<HGBinding>>::vector[abi:dee210106]()
00000000006875c5	addq	$0x10, %rsp
00000000006875c9	popq	%rbp
00000000006875ca	retq
00000000006875cb	nopl	(%rax,%rax)
__ZNSt3__16vectorI9HGBindingNS_9allocatorIS1_EEE9push_backB9dee210106EOS1_:
00000000006875d0	pushq	%rbp
00000000006875d1	movq	%rsp, %rbp
__ZN9HGBindingC2ENS_9AttributeEPKcjNS_9AddrSpaceEjt:
0000000000688d70	pushq	%rbp
0000000000688d71	movq	%rsp, %rbp
0000000000688d74	subq	$0x30, %rsp
0000000000688d78	movw	0x10(%rbp), %ax
0000000000688d7c	movq	%rdi, -0x8(%rbp)
0000000000688d80	movl	%esi, -0xc(%rbp)
0000000000688d83	movq	%rdx, -0x18(%rbp)
0000000000688d87	movl	%ecx, -0x1c(%rbp)
0000000000688d8a	movl	%r8d, -0x20(%rbp)
0000000000688d8e	movl	%r9d, -0x24(%rbp)
0000000000688d92	movq	-0x8(%rbp), %rdi
0000000000688d96	movq	%rdi, -0x30(%rbp)
0000000000688d9a	movl	-0xc(%rbp), %eax
0000000000688d9d	movl	%eax, (%rdi)
0000000000688d9f	addq	$0x8, %rdi
0000000000688da3	movq	-0x18(%rbp), %rsi
0000000000688da7	callq	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1B9dee210106ILi0EEEPKc ## std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>::basic_string[abi:dee210106]<0>(char const*)
0000000000688dac	movq	-0x30(%rbp), %rax
0000000000688db0	movl	-0x1c(%rbp), %ecx
0000000000688db3	movl	%ecx, 0x20(%rax)
0000000000688db6	movl	-0x20(%rbp), %ecx
0000000000688db9	movl	%ecx, 0x24(%rax)
0000000000688dbc	movl	-0x24(%rbp), %ecx
0000000000688dbf	movl	%ecx, 0x28(%rax)
0000000000688dc2	movzwl	0x10(%rbp), %ecx
0000000000688dc6	movl	%ecx, 0x2c(%rax)
0000000000688dc9	addq	$0x30, %rsp
0000000000688dcd	popq	%rbp
0000000000688dce	retq
0000000000688dcf	nop
__ZN9HGBindingD2Ev:
0000000000688dd0	pushq	%rbp
0000000000688dd1	movq	%rsp, %rbp
0000000000688dd4	subq	$0x10, %rsp
0000000000688dd8	movq	%rdi, -0x8(%rbp)
0000000000688ddc	movq	-0x8(%rbp), %rdi
0000000000688de0	addq	$0x8, %rdi
0000000000688de4	callq	0x6dfb58                        ## symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
0000000000688de9	addq	$0x10, %rsp
0000000000688ded	popq	%rbp
0000000000688dee	retq
0000000000688def	nop
__ZL12HGAllocAlignm:
0000000000688df0	pushq	%rbp
0000000000688df1	movq	%rsp, %rbp
0000000000688df4	subq	$0x30, %rsp
0000000000688df8	movq	%rdi, -0x8(%rbp)
0000000000688dfc	movq	-0x8(%rbp), %rax
0000000000688e00	addq	$0x8, %rax
0000000000688e04	addq	$0x1f, %rax
0000000000688e08	movq	%rax, -0x10(%rbp)
0000000000688e0c	movq	-0x10(%rbp), %rdi
__ZN9HGBindingC1EOS_:
00000000006898c0	pushq	%rbp
00000000006898c1	movq	%rsp, %rbp
00000000006898c4	subq	$0x10, %rsp
00000000006898c8	movq	%rdi, -0x8(%rbp)
00000000006898cc	movq	%rsi, -0x10(%rbp)
00000000006898d0	movq	-0x8(%rbp), %rdi
00000000006898d4	movq	-0x10(%rbp), %rsi
00000000006898d8	callq	__ZN9HGBindingC2EOS_            ## HGBinding::HGBinding(HGBinding&&)
00000000006898dd	addq	$0x10, %rsp
00000000006898e1	popq	%rbp
00000000006898e2	retq
00000000006898e3	nopw	%cs:(%rax,%rax)
__ZN9HGBindingC2EOS_:
__ZN9HGBindingC2EOS_:
00000000006898f0	pushq	%rbp
00000000006898f0	pushq	%rbp
00000000006898f1	movq	%rsp, %rbp
00000000006898f1	movq	%rsp, %rbp
00000000006898f4	subq	$0x20, %rsp
00000000006898f8	movq	%rdi, -0x8(%rbp)
00000000006898fc	movq	%rsi, -0x10(%rbp)
0000000000689900	movq	-0x8(%rbp), %rdi
0000000000689904	movq	%rdi, -0x18(%rbp)
0000000000689908	movq	-0x10(%rbp), %rax
000000000068990c	movl	(%rax), %eax
000000000068990e	movl	%eax, (%rdi)
0000000000689910	addq	$0x8, %rdi
0000000000689914	movq	-0x10(%rbp), %rsi
0000000000689918	addq	$0x8, %rsi
000000000068991c	callq	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1B9dee210106EOS5_ ## std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>::basic_string[abi:dee210106](std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>>&&)
0000000000689921	movq	-0x18(%rbp), %rax
0000000000689925	movq	-0x10(%rbp), %rcx
0000000000689929	movq	0x20(%rcx), %rdx
000000000068992d	movq	%rdx, 0x20(%rax)
0000000000689931	movq	0x28(%rcx), %rcx
0000000000689935	movq	%rcx, 0x28(%rax)
0000000000689939	addq	$0x20, %rsp
000000000068993d	popq	%rbp
000000000068993e	retq
000000000068993f	nop
__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1B9dee210106EOS5_:
0000000000689940	pushq	%rbp
0000000000689941	movq	%rsp, %rbp
0000000000689944	subq	$0x10, %rsp
0000000000689948	movq	%rdi, -0x8(%rbp)
000000000068994c	movq	%rsi, -0x10(%rbp)
